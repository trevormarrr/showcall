import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import http from "http";
import osc from "osc";
import { WebSocketServer } from "ws";

// Load .env from working directory first (dev convenience)
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// User-writable config directory
const USER_DATA_DIR = process.env.SERVER_USER_DATA
  || (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support', 'ShowCall')
      : process.platform === 'win32'
        ? path.join(os.homedir(), 'AppData', 'Roaming', 'ShowCall')
        : path.join(os.homedir(), '.showcall'));
try { fs.mkdirSync(USER_DATA_DIR, { recursive: true }); } catch {}

const USER_ENV_PATH = path.join(USER_DATA_DIR, '.env');
const USER_PRESETS_PATH = path.join(USER_DATA_DIR, 'presets.json');

// Preset Banks: Support up to 5 banks (preset-bank-1.json through preset-bank-5.json)
const MAX_PRESET_BANKS = 5;
function getBankPath(bankId = 1) {
  const id = Math.max(1, Math.min(MAX_PRESET_BANKS, parseInt(bankId) || 1));
  return path.join(USER_DATA_DIR, `preset-bank-${id}.json`);
}

function getMetadataPath() {
  return path.join(USER_DATA_DIR, 'presets-metadata.json');
}

// Function to ensure user config exists - defined early
async function ensureUserConfig() {
  try {
    await fs.promises.access(USER_ENV_PATH);
    console.log(`✅ User config found: ${USER_ENV_PATH}`);
  } catch {
    console.log(`📝 Creating default user config: ${USER_ENV_PATH}`);
    const defaultConfig = `# ShowCall Configuration
# Resolume connection settings
RESOLUME_HOST=10.1.110.72
RESOLUME_REST_PORT=8080
RESOLUME_OSC_PORT=7000

# Server settings
PORT=3200
NODE_ENV=production

# Set to 1 to enable mock mode (for testing without Resolume)
MOCK=0
`;
    await fs.promises.writeFile(USER_ENV_PATH, defaultConfig);
    console.log("✅ Default config created");
  }
}

// Try to load .env from a user-writable location if not already provided
if (!process.env.RESOLUME_HOST) {
  if (fs.existsSync(USER_ENV_PATH)) {
    console.log(`Loading user config from: ${USER_ENV_PATH}`);
    dotenv.config({ path: USER_ENV_PATH, override: false });
  } else {
    // Seed a default .env file for users to edit
    console.log(`Creating default config at: ${USER_ENV_PATH}`);
    const defaultEnv = `PORT=3200\nRESOLUME_HOST=10.1.110.72\nRESOLUME_REST_PORT=8080\nRESOLUME_OSC_PORT=7000\nMOCK=0\n`;
    try {
      fs.writeFileSync(USER_ENV_PATH, defaultEnv, { flag: 'wx' });
      dotenv.config({ path: USER_ENV_PATH, override: false });
    } catch (e) {
      console.warn('Could not create default .env:', e.message);
    }
  }
}

// Resolve static public directory robustly across dev/packaged
function resolvePublicDir() {
  let candidates;
  if (process.env.NODE_ENV === 'production' && process.env.RESOURCES_PATH) {
    candidates = [
      path.join(process.env.RESOURCES_PATH, 'app.asar', 'public'),
      path.join(process.env.RESOURCES_PATH, 'public')
    ];
  } else {
    candidates = [
      path.join(__dirname, 'public'),
      path.join(process.cwd(), 'public')
    ];
  }
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  console.error('✖ No public directory found!');
  return null;
}

const PUBLIC_DIR = resolvePublicDir();
if (PUBLIC_DIR) {
  app.use(express.static(PUBLIC_DIR));
  console.log(`✅ Serving UI from: ${PUBLIC_DIR}`);
}

// Resolume Arena Configuration
const HOST = process.env.RESOLUME_HOST || "localhost";
const REST_PORT = process.env.RESOLUME_REST_PORT || "8080";
const OSC_PORT = process.env.RESOLUME_OSC_PORT || "7000";
const MOCK = process.env.MOCK === "1";

const baseUrl = () => `http://${HOST}:${REST_PORT}`;

// Connection state
let isResolumeConnected = false;
let isOSCConnected = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 3000;

// Companion WebSocket clients
const companionClients = new Set();
let lastStatusState = null;
let activePresetId = null; // Track currently executing preset

// OSC Setup
let oscPort = null;

function initOSC() {
  if (MOCK) {
    console.log("🎭 MOCK mode - OSC disabled");
    return;
  }
  try {
    oscPort = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 57121,
      remoteAddress: HOST,
      remotePort: parseInt(OSC_PORT),
      metadata: true
    });
    oscPort.on("ready", () => {
      console.log(`✅ OSC ready - sending to ${HOST}:${OSC_PORT}`);
      isOSCConnected = true;
    });
    oscPort.on("error", (error) => {
      console.error("✖ OSC Error:", error.message);
      isOSCConnected = false;
    });
    oscPort.open();
  } catch (error) {
    console.error("✖ Failed to initialize OSC:", error.message);
    isOSCConnected = false;
  }
}

// Send OSC message to Resolume
function sendOSC(address, value = 1) {
  if (MOCK) {
    console.log(`🎭 MOCK OSC: ${address} ${value}`);
    return Promise.resolve({ ok: true });
  }
  if (!oscPort) return Promise.reject(new Error("OSC not initialized"));
  return new Promise((resolve, reject) => {
    try {
      const message = { address, args: [{ type: "i", value }] };
      console.log(`🎵 OSC → ${address} ${value}`);
      oscPort.send(message);
      resolve({ ok: true });
    } catch (error) {
      console.error(`✖ OSC send failed:`, error.message);
      reject(error);
    }
  });
}

// HTTP helpers
async function resolumeRequest(method, urlPath, data = null) {
  const url = `${baseUrl()}${urlPath}`;
  const config = {
    method,
    url,
    timeout: 5000,
    headers: { 'Accept': 'application/json' }
  };
  if (data !== null && (method === 'PUT' || method === 'POST')) {
    config.headers['Content-Type'] = 'application/json';
    config.data = JSON.stringify(data);
  }
  try {
    console.log(`🔗 ${method} ${url}`, data !== null ? JSON.stringify(data) : '');
    const response = await axios(config);
    isResolumeConnected = true;
    lastConnectionCheck = Date.now();
    return response.data;
  } catch (error) {
    isResolumeConnected = false;
    const errorMsg = error.response?.data?.error || error.response?.statusText || error.message;
    console.error(`✖ Resolume ${method} ${urlPath} failed:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Resolume error: ${errorMsg}`);
  }
}

// Get composition status from Resolume
async function getCompositionStatus() {
  if (MOCK) {
    return {
      name: "Weekend_Main",
      layers: [
        { name: { value: "Background" }, clips: [
          { name: { value: "Walk-In BG" }, connected: { value: 0 } },
          { name: { value: "Sermon BG" }, connected: { value: "Connected" } },
          { name: { value: "Baptism BG" }, connected: { value: 0 } }
        ]},
        { name: { value: "Video Feed" }, clips: [
          { name: { value: "NDI Feed" }, connected: { value: 0 } },
          { name: { value: "Camera 1" }, connected: { value: "Connected" } },
          { name: { value: "Baptism Cam" }, connected: { value: 0 } }
        ]}
      ],
      transport: { bpm: { value: 120 } }
    };
  }
  return resolumeRequest('GET', '/api/v1/composition');
}

// Parse Resolume composition
function parseCompositionStatus(data) {
  if (!data) return getDefaultStatus();
  try {
    let programClips = []; // Change to array to handle multiple clips
    let previewClip = null;
    
    console.log("🔍 Raw composition data layers:", data.layers?.length);
    
    if (data.layers && Array.isArray(data.layers)) {
      data.layers.forEach((layer, layerIdx) => {
        if (layer.clips && Array.isArray(layer.clips)) {
          layer.clips.forEach((clip, clipIdx) => {
            // Only check clips that are actually connected (not empty or disconnected)
            if (clip && clip.connected && clip.connected.value === 'Connected') {
              const clipInfo = {
                layer: layerIdx + 1,
                column: clipIdx + 1,
                clipName: clip.name?.value || `Clip ${clipIdx + 1}`,
                layerName: layer.name?.value || `Layer ${layerIdx + 1}`
              };
              
              console.log(`� CONNECTED clip found: L${clipInfo.layer}C${clipInfo.column} - ${clipInfo.clipName}`);
              
              // Add to program clips array
              programClips.push(clipInfo);
            }
          });
        }
      });
    }
    
    console.log("🔍 Final result - Program clips:", programClips, "Preview:", previewClip);
    
    let bpm = "—";
    if (data.tempocontroller?.tempo && typeof data.tempocontroller.tempo.value === 'number') {
      bpm = Math.round(data.tempocontroller.tempo.value);
    }
    return {
      programClips: programClips, // Return array of all active clips
      program: programClips[0] || { layer: "—", column: "—", clipName: "—", layerName: "—" }, // Keep first for backwards compatibility
      preview: previewClip || { layer: "—", column: "—", clipName: "—", layerName: "—" },
      bpm,
      comp: data.name?.value || data.name || "Unknown",
      connected: true,
      host: HOST,
      restPort: REST_PORT,
      oscPort: OSC_PORT,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Error parsing composition:", error);
    return getDefaultStatus();
  }
}

function getDefaultStatus() {
  return {
    program: { layer: "—", column: "—", clipName: "—", layerName: "—" },
    preview: { layer: "—", column: "—", clipName: "—", layerName: "—" },
    bpm: "—",
    comp: "—",
    connected: false,
    timestamp: Date.now()
  };
}

// Composition (structured) API
app.get("/api/composition", async (req, res) => {
  try {
    const composition = await resolumeRequest('GET', '/api/v1/composition');
    const getStringValue = (obj) => {
      if (!obj) return null;
      if (typeof obj === 'string') return obj;
      if (obj.value && typeof obj.value === 'string') return obj.value;
      return null;
    };
    const structure = {
      connected: true,
      compositionName: getStringValue(composition.name) || "Unknown",
      layers: composition.layers?.map((layer, layerIdx) => ({
        id: layerIdx + 1,
        name: getStringValue(layer.name) || `Layer ${layerIdx + 1}`,
        clips: layer.clips?.map((clip, clipIdx) => {
          const clipName = getStringValue(clip.name);
          return {
            layer: layerIdx + 1,
            column: clipIdx + 1,
            name: clipName,
            connected: clip.connected?.value || 0,
            isEmpty: !clipName || clipName.trim() === ''
          };
        }) || []
      })) || [],
      maxColumns: Math.max(...(composition.layers?.map(l => l.clips?.length || 0) || [0])),
      timestamp: Date.now()
    };
    res.json(structure);
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message, timestamp: Date.now() });
  }
});

// Debug endpoint
app.get("/api/debug", async (req, res) => {
  try {
    const composition = await resolumeRequest('GET', '/api/v1/composition');
    const debugInfo = {
      connected: true,
      resolumeUrl: baseUrl(),
      compositionName: composition.name?.value || composition.name || "Unknown",
      layerCount: composition.layers?.length || 0,
      layersInfo: composition.layers?.map((layer, idx) => ({
        apiIndex: idx,
        uiIndex: idx + 1,
        name: layer.name?.value || layer.name || `Layer ${idx + 1}`,
        clipCount: layer.clips?.length || 0
      })) || [],
      timestamp: Date.now()
    };
    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message, resolumeUrl: baseUrl(), timestamp: Date.now() });
  }
});

// Control APIs (OSC)
async function triggerClip(layer, column) {
  if (MOCK) return { ok: true, action: "trigger", layer, column };
  try {
    const oscAddress = `/composition/layers/${layer}/clips/${column}/connect`;
    await sendOSC(oscAddress, 1);
    return { ok: true, action: "trigger", layer, column, method: "osc" };
  } catch (error) {
    return { ok: false, error: error.message, action: "trigger", layer, column };
  }
}

async function triggerColumn(column) {
  if (MOCK) return { ok: true, action: "triggerColumn", column };
  try {
    const oscAddress = `/composition/columns/${column}/connect`;
    await sendOSC(oscAddress, 1);
    return { ok: true, action: "triggerColumn", column, method: "osc" };
  } catch (error) {
    return { ok: false, error: error.message, action: "triggerColumn", column };
  }
}

async function cutToProgram() {
  if (MOCK) return { ok: true, action: "cut" };
  try {
    await sendOSC("/composition/tempocontroller/resync", 1);
    return { ok: true, action: "cut", method: "osc" };
  } catch (error) {
    return { ok: false, error: error.message, action: "cut" };
  }
}

async function clearAll() {
  if (MOCK) return { ok: true, action: "clear" };
  try {
    await sendOSC("/composition/disconnectall", 1);
    return { ok: true, action: "clear", method: "osc" };
  } catch (error) {
    return { ok: false, error: error.message, action: "clear" };
  }
}

app.post("/api/trigger", async (req, res) => {
  const { layer, column } = req.body;
  if (!layer || !column) return res.status(400).json({ ok: false, error: "Missing layer or column" });
  const result = await triggerClip(parseInt(layer), parseInt(column));
  res.json(result);
});

app.post("/api/triggerColumn", async (req, res) => {
  const { column } = req.body;
  if (!column) return res.status(400).json({ ok: false, error: "Missing column" });
  const result = await triggerColumn(parseInt(column));
  res.json(result);
});

app.post("/api/cut", async (req, res) => {
  res.json(await cutToProgram());
});

app.post("/api/clear", async (req, res) => {
  res.json(await clearAll());
});

// Macro execution
async function executeMacro(steps) {
  const results = [];
  for (const [index, step] of steps.entries()) {
    try {
      let result;
      switch (String(step.type || '').toLowerCase()) {
        case 'trigger':
          result = await triggerClip(step.layer, step.column); break;
        case 'triggercolumn':
          result = await triggerColumn(step.column); break;
        case 'cut':
          result = await cutToProgram(); break;
        case 'clear':
          result = await clearAll(); break;
        case 'sleep':
          await new Promise(r => setTimeout(r, step.ms || 100));
          result = { ok: true, action: 'sleep', ms: step.ms || 100 }; break;
        default:
          result = { ok: false, error: `Unknown step type: ${step.type}` };
      }
      results.push({ step: index + 1, ...result });
      if (!result.ok && step.critical !== false) {
        break;
      }
    } catch (error) {
      results.push({ step: index + 1, ok: false, error: error.message, action: step.type });
      break;
    }
  }
  return results;
}

app.post("/api/macro", async (req, res) => {
  const { macro = [], id, name } = req.body;
  console.log(`📥 Received macro request: ${name} (${id})`);
  console.log(`📋 Macro steps:`, JSON.stringify(macro, null, 2));
  if (!Array.isArray(macro) || macro.length === 0) {
    return res.status(400).json({ ok: false, error: "Invalid macro" });
  }
  const results = await executeMacro(macro);
  console.log(`✅ Macro execution complete:`, JSON.stringify(results, null, 2));
  res.json({ ok: true, id, name, results, totalSteps: macro.length });
});

// Settings API
app.get('/api/settings', async (req, res) => {
  res.json({
    resolumeHost: process.env.RESOLUME_HOST || '10.1.110.72',
    resolumeRestPort: parseInt(process.env.RESOLUME_REST_PORT || '8080'),
    resolumeOscPort: parseInt(process.env.RESOLUME_OSC_PORT || '7000'),
    serverPort: parseInt(process.env.PORT || '3200')
  });
});

app.post('/api/settings', async (req, res) => {
  try {
    const { resolumeHost, resolumeRestPort, resolumeOscPort, serverPort } = req.body || {};
    if (!resolumeHost) return res.status(400).json({ ok: false, error: 'resolumeHost required' });
    const rest = parseInt(resolumeRestPort);
    const oscP = parseInt(resolumeOscPort);
    const srv = parseInt(serverPort);
    if (!(rest >= 1 && rest <= 65535)) return res.status(400).json({ ok: false, error: 'Invalid REST port' });
    if (!(oscP >= 1 && oscP <= 65535)) return res.status(400).json({ ok: false, error: 'Invalid OSC port' });
    if (!(srv >= 1024 && srv <= 65535)) return res.status(400).json({ ok: false, error: 'Invalid server port' });

    const content = `# ShowCall Configuration\nRESOLUME_HOST=${resolumeHost}\nRESOLUME_REST_PORT=${rest}\nRESOLUME_OSC_PORT=${oscP}\nPORT=${srv}\nMOCK=${process.env.MOCK === '1' ? '1' : '0'}\n`;
    await fs.promises.writeFile(USER_ENV_PATH, content);
    res.json({ ok: true });
    setTimeout(() => process.exit(0), 250); // Let Electron respawn the server
  } catch (e) {
    console.error('Failed to save settings:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Helper: Load bank metadata (current bank, bank names)
async function loadBankMetadata() {
  try {
    if (fs.existsSync(getMetadataPath())) {
      const json = await fs.promises.readFile(getMetadataPath(), 'utf-8');
      return JSON.parse(json);
    }
  } catch {}
  // Return default metadata
  return {
    currentBank: 1,
    bankNames: {
      '1': 'Bank 1',
      '2': 'Bank 2',
      '3': 'Bank 3',
      '4': 'Bank 4',
      '5': 'Bank 5'
    }
  };
}

// Helper: Save bank metadata
async function saveBankMetadata(metadata) {
  try {
    await fs.promises.writeFile(getMetadataPath(), JSON.stringify(metadata, null, 2));
  } catch (e) {
    console.error('Failed to save bank metadata:', e.message);
  }
}

// Helper: Load a specific bank
async function loadBank(bankId = 1) {
  try {
    const bankPath = getBankPath(bankId);
    if (fs.existsSync(bankPath)) {
      const json = await fs.promises.readFile(bankPath, 'utf-8');
      return JSON.parse(json);
    }
  } catch {}
  // Return empty bank structure
  return { presets: [], quickCues: [] };
}

// Helper: Save a specific bank
async function saveBank(bankId, data) {
  try {
    const bankPath = getBankPath(bankId);
    await fs.promises.writeFile(bankPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Failed to save bank ${bankId}:`, e.message);
    throw e;
  }
}

// Helper: Ensure all banks exist (called on startup)
async function ensureBanksExist() {
  try {
    console.log("📦 Checking preset banks...");
    
    // First, try to migrate legacy presets.json to Bank 1 if it exists
    if (fs.existsSync(USER_PRESETS_PATH)) {
      const bank1Path = getBankPath(1);
      if (!fs.existsSync(bank1Path)) {
        console.log("🔄 Migrating legacy presets.json to Bank 1...");
        try {
          const legacyJson = await fs.promises.readFile(USER_PRESETS_PATH, 'utf-8');
          const legacyData = JSON.parse(legacyJson);
          await saveBank(1, legacyData);
          console.log("✅ Legacy presets migrated to Bank 1");
        } catch (migrationError) {
          console.error("⚠️ Migration failed:", migrationError.message);
        }
      }
    }
    
    // Create all 5 banks if they don't exist (with empty structure)
    for (let i = 1; i <= MAX_PRESET_BANKS; i++) {
      const bankPath = getBankPath(i);
      if (!fs.existsSync(bankPath)) {
        console.log(`📝 Creating Bank ${i}...`);
        await saveBank(i, { presets: [], quickCues: [] });
      }
    }
    
    // Ensure metadata file exists
    const metadataPath = getMetadataPath();
    if (!fs.existsSync(metadataPath)) {
      console.log("📝 Creating bank metadata...");
      const defaultMetadata = {
        currentBank: 1,
        bankNames: {
          '1': 'Bank 1',
          '2': 'Bank 2',
          '3': 'Bank 3',
          '4': 'Bank 4',
          '5': 'Bank 5'
        }
      };
      await saveBankMetadata(defaultMetadata);
    }
    
    console.log("✅ All preset banks ready");
  } catch (e) {
    console.error("❌ Failed to ensure banks exist:", e.message);
    throw e;
  }
}

// Presets API (now bank-aware)
app.get('/api/presets', async (req, res) => {
  try {
    const bankId = req.query.bank || 1;
    const metadata = await loadBankMetadata();
    
    // Try to load from new bank system first
    const bankData = await loadBank(bankId);
    if (bankData.presets && bankData.presets.length > 0) {
      return res.json({
        ...bankData,
        currentBank: parseInt(bankId),
        bankMetadata: metadata
      });
    }
    
    // Fallback to legacy presets.json for backwards compatibility
    if (bankId === 1 && fs.existsSync(USER_PRESETS_PATH)) {
      const json = await fs.promises.readFile(USER_PRESETS_PATH, 'utf-8');
      const data = JSON.parse(json);
      return res.json({
        ...data,
        currentBank: 1,
        bankMetadata: metadata
      });
    }
    
    // Fallback to packaged config.json
    const fallback = path.join(PUBLIC_DIR || __dirname, 'config.json');
    const json = await fs.promises.readFile(fallback, 'utf-8');
    const data = JSON.parse(json);
    return res.json({
      ...data,
      currentBank: parseInt(bankId),
      bankMetadata: metadata
    });
  } catch (e) {
    console.error('Failed to load presets:', e.message);
    res.status(500).json({ presets: [], quickCues: [], error: e.message });
  }
});

app.post('/api/presets', async (req, res) => {
  try {
    const bankId = req.query.bank || 1;
    const data = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    
    // Save to the appropriate bank
    await saveBank(bankId, data);
    
    // Update metadata
    const metadata = await loadBankMetadata();
    metadata.currentBank = parseInt(bankId);
    await saveBankMetadata(metadata);
    
    // Broadcast updated presets to all connected Companion clients
    const message = JSON.stringify({
      type: 'presets_updated',
      data: data.presets || [],
      timestamp: Date.now(),
      bank: parseInt(bankId)
    });
    
    companionClients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          console.log(`🎛️ Broadcasted preset update (bank ${bankId}) to Companion client`);
        } catch (error) {
          console.error('🎛️ Failed to send preset update to Companion:', error);
          companionClients.delete(client);
        }
      }
    });
    
    res.json({ ok: true, bank: parseInt(bankId) });
  } catch (e) {
    console.error('Failed to save presets:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Bank Management APIs

// IMPORTANT: More specific routes MUST come before generic :id routes
// So /api/banks/export/:id and /api/banks/switch must be before /api/banks/:id/presets

app.get('/api/banks/export/:id', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    if (bankId < 1 && bankId !== -1) { // -1 for export all
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    
    const metadata = await loadBankMetadata();
    
    if (bankId === -1) {
      // Export all banks
      const allBanks = {};
      for (let i = 1; i <= MAX_PRESET_BANKS; i++) {
        const bank = await loadBank(i);
        allBanks[`bank_${i}`] = {
          name: metadata.bankNames[i] || `Bank ${i}`,
          data: bank
        };
      }
      res.json({
        exportType: 'all_banks',
        timestamp: new Date().toISOString(),
        banks: allBanks
      });
    } else {
      // Export single bank
      const bank = await loadBank(bankId);
      res.json({
        exportType: 'single_bank',
        bankId,
        bankName: metadata.bankNames[bankId] || `Bank ${bankId}`,
        timestamp: new Date().toISOString(),
        data: bank
      });
    }
  } catch (e) {
    console.error('Failed to export bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/banks/switch', async (req, res) => {
  try {
    const { bankId } = req.body;
    if (!bankId || bankId < 1 || bankId > MAX_PRESET_BANKS) {
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    
    const metadata = await loadBankMetadata();
    metadata.currentBank = parseInt(bankId);
    await saveBankMetadata(metadata);
    
    const bank = await loadBank(bankId);
    res.json({
      ok: true,
      activeBank: parseInt(bankId),
      bankName: metadata.bankNames[bankId] || `Bank ${bankId}`,
      presets: bank.presets || [],
      quickCues: bank.quickCues || []
    });
  } catch (e) {
    console.error('Failed to switch bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Now the generic :id routes come AFTER the specific ones
app.get('/api/banks', async (req, res) => {
  try {
    const metadata = await loadBankMetadata();
    const banks = [];
    
    // Load all banks with info
    for (let i = 1; i <= MAX_PRESET_BANKS; i++) {
      const bank = await loadBank(i);
      banks.push({
        id: i,
        name: metadata.bankNames[i] || `Bank ${i}`,
        presetCount: (bank.presets || []).length,
        hasContent: (bank.presets || []).length > 0
      });
    }
    
    res.json({
      ok: true,
      banks,
      currentBank: metadata.currentBank,
      bankNames: metadata.bankNames,
      maxBanks: MAX_PRESET_BANKS
    });
  } catch (e) {
    console.error('Failed to load banks:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Get a specific bank's presets (view only, don't activate)
app.get('/api/banks/:id/presets', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    if (bankId < 1 || bankId > MAX_PRESET_BANKS) {
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    
    const metadata = await loadBankMetadata();
    const bank = await loadBank(bankId);
    
    res.json({
      ok: true,
      bank: bankId,
      bankName: metadata.bankNames[bankId] || `Bank ${bankId}`,
      activeBank: metadata.currentBank,
      presets: bank.presets || [],
      quickCues: bank.quickCues || []
    });
  } catch (e) {
    console.error('Failed to load bank presets:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/banks/:id/rename', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    const { name } = req.body;
    
    if (bankId < 1 || bankId > MAX_PRESET_BANKS) {
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    if (!name || typeof name !== 'string' || name.length > 50) {
      return res.status(400).json({ ok: false, error: 'Invalid name' });
    }
    
    const metadata = await loadBankMetadata();
    metadata.bankNames[bankId] = name;
    await saveBankMetadata(metadata);
    
    res.json({ ok: true, bank: bankId, name });
  } catch (e) {
    console.error('Failed to rename bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/banks/:id/clear', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    if (bankId < 1 || bankId > MAX_PRESET_BANKS) {
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    
    await saveBank(bankId, { presets: [], quickCues: [] });
    res.json({ ok: true, bank: bankId, message: 'Bank cleared' });
  } catch (e) {
    console.error('Failed to clear bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/banks/export/:id', async (req, res) => {
  try {
    const bankId = parseInt(req.params.id);
    if (bankId < 1 && bankId !== -1) { // -1 for export all
      return res.status(400).json({ ok: false, error: 'Invalid bank ID' });
    }
    
    const metadata = await loadBankMetadata();
    
    if (bankId === -1) {
      // Export all banks
      const allBanks = {};
      for (let i = 1; i <= MAX_PRESET_BANKS; i++) {
        const bank = await loadBank(i);
        allBanks[`bank_${i}`] = {
          name: metadata.bankNames[i] || `Bank ${i}`,
          data: bank
        };
      }
      res.json({
        exportType: 'all_banks',
        timestamp: new Date().toISOString(),
        banks: allBanks
      });
    } else {
      // Export single bank
      const bank = await loadBank(bankId);
      res.json({
        exportType: 'single_bank',
        bankId,
        bankName: metadata.bankNames[bankId] || `Bank ${bankId}`,
        timestamp: new Date().toISOString(),
        data: bank
      });
    }
  } catch (e) {
    console.error('Failed to export bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/banks/import', async (req, res) => {
  try {
    const { sourceBank, targetBank, overwrite } = req.body;
    
    if (!sourceBank || !targetBank) {
      return res.status(400).json({ ok: false, error: 'sourceBank and targetBank required' });
    }
    
    const targetId = parseInt(targetBank);
    if (targetId < 1 || targetId > MAX_PRESET_BANKS) {
      return res.status(400).json({ ok: false, error: 'Invalid target bank ID' });
    }
    
    // Load source bank data
    const sourceBankData = sourceBank.data || sourceBank;
    
    // Load or create target
    let targetBankData = await loadBank(targetId);
    
    if (overwrite) {
      // Replace entire bank
      targetBankData = sourceBankData;
    } else {
      // Merge presets (avoid duplicates by ID)
      const existingIds = new Set((targetBankData.presets || []).map(p => p.id));
      const newPresets = (sourceBankData.presets || []).filter(p => !existingIds.has(p.id));
      targetBankData.presets = [...(targetBankData.presets || []), ...newPresets];
      targetBankData.quickCues = sourceBankData.quickCues || targetBankData.quickCues;
    }
    
    await saveBank(targetId, targetBankData);
    
    res.json({
      ok: true,
      targetBank: targetId,
      presetCount: (targetBankData.presets || []).length
    });
  } catch (e) {
    console.error('Failed to import bank:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Simple NDI API endpoints
app.get('/api/ndi/status', async (req, res) => {
  try {
    // Return simple status - NDI available through manual OBS setup
    res.json({
      connected: false, // User needs to manually start OBS
      obsRunning: false,
      ndiSources: [],
      streamUrl: null,
      message: 'Start OBS Studio manually with NDI source, then enable preview'
    });
  } catch (error) {
    console.error('Failed to get NDI status:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: error.message 
    });
  }
});

app.post('/api/ndi/switch', async (req, res) => {
  try {
    const { sourceId } = req.body;
    
    // Simple response - user needs to switch manually in OBS
    res.json({ 
      ok: true, 
      message: `Switch to NDI source "${sourceId}" in OBS Studio manually`,
      sourceId 
    });
    
  } catch (error) {
    console.error('Failed to switch NDI source:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/ndi/restart', async (req, res) => {
  try {
    // Simple restart message
    res.json({ 
      ok: true, 
      message: 'Restart OBS Studio manually to refresh NDI sources' 
    });
  } catch (error) {
    console.error('Failed to restart NDI bridge:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Update check API (GitHub Releases)
async function getAppVersion() {
  const candidates = [
    path.join(__dirname, 'package.json'),
    process.env.RESOURCES_PATH && path.join(process.env.RESOURCES_PATH, 'app.asar', 'package.json'),
    process.env.RESOURCES_PATH && path.join(process.env.RESOURCES_PATH, 'package.json')
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const j = JSON.parse(await fs.promises.readFile(p, 'utf-8'));
        if (j.version) return String(j.version);
      }
    } catch {}
  }
  return '0.0.0';
}

app.get('/api/update/check', async (req, res) => {
  try {
    const currentVersion = await getAppVersion();
    const { data } = await axios.get('https://api.github.com/repos/trevormarrr/showcall/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'showcall-app' },
      timeout: 5000
    });
    const latestVersion = data.tag_name?.replace(/^v/, '') || data.name || '0.0.0';
    const assets = data.assets || [];
    const findAsset = (exts) => {
      const a = assets.find(a => exts.some(ext => a.name?.toLowerCase().endsWith(ext)));
      return a ? a.browser_download_url : null;
    };
    const resp = {
      currentVersion,
      latestVersion,
      updateAvailable: latestVersion !== currentVersion,
      releaseUrl: data.html_url,
      assets: {
        mac: findAsset(['.dmg', '.zip']),
        win: findAsset(['.exe', '.msi']),
        linux: findAsset(['.AppImage', '.deb'])
      }
    };
    res.json(resp);
  } catch (e) {
    console.error('Update check failed:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Health + connection APIs
async function checkConnection() {
  if (MOCK) return { connected: true, osc: true, host: "MOCK", restPort: "MOCK", oscPort: "MOCK" };
  const now = Date.now();
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return { connected: isResolumeConnected, osc: isOSCConnected, host: HOST, restPort: REST_PORT, oscPort: OSC_PORT };
  }
  try {
    await resolumeRequest('GET', '/api/v1/composition');
    return { connected: true, osc: isOSCConnected, host: HOST, restPort: REST_PORT, oscPort: OSC_PORT };
  } catch (error) {
    return { connected: false, osc: isOSCConnected, host: HOST, restPort: REST_PORT, oscPort: OSC_PORT, error: error.message };
  }
}

app.get("/health", async (req, res) => {
  const connection = await checkConnection();
  res.json({ ok: true, resolume: connection.connected, host: connection.host, port: connection.restPort, timestamp: Date.now() });
});

app.get("/api/connection", async (req, res) => {
  const connection = await checkConnection();
  res.json(connection);
});

// Server-Sent Events for real-time status
app.get("/api/status", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  res.flushHeaders();
  let isActive = true;
  const sendStatus = async () => {
    if (!isActive) return;
    try {
      const composition = await getCompositionStatus();
      const status = parseCompositionStatus(composition);
      
      // Store for Companion clients
      lastStatusState = status;
      
      // Send to SSE clients
      res.write(`data: ${JSON.stringify(status)}\n\n`);
      
      // Broadcast to Companion clients
      broadcastToCompanion(status);
      
    } catch (error) {
      const errorStatus = { ...getDefaultStatus(), error: error.message };
      lastStatusState = errorStatus;
      res.write(`data: ${JSON.stringify(errorStatus)}\n\n`);
      broadcastToCompanion(errorStatus);
    }
  };
  await sendStatus();
  const timer = setInterval(sendStatus, 1000);
  req.on("close", () => { isActive = false; clearInterval(timer); });
  req.on("error", () => { isActive = false; clearInterval(timer); });
});

// Serve frontend
app.use((req, res) => {
  if (PUBLIC_DIR) {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  } else {
    res.status(500).send('UI not available');
  }
});

// Global NDI bridge instance
let ndiBridge = null;

// Companion WebSocket broadcast function
function broadcastToCompanion(status) {
  if (companionClients.size === 0) return;
  
  const message = JSON.stringify({
    type: 'status_update',
    data: status,
    timestamp: Date.now()
  });
  
  companionClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error('🎛️ Failed to send to Companion client:', error);
        companionClients.delete(client);
      }
    }
  });
}

// Initialize the app
async function initializeApp() {
  try {
    console.log("Starting ShowCall server...");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("RESOURCES_PATH:", process.env.RESOURCES_PATH);
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    console.log("USER_DATA_DIR:", USER_DATA_DIR);
    console.log("USER_ENV_PATH:", USER_ENV_PATH);
    await ensureUserConfig();
    await ensureBanksExist();

    // Start server
    const PORT = process.env.PORT || 3200;
    const server = http.createServer(app);
    
    // WebSocket server for Companion integration
    const wss = new WebSocketServer({ 
      server,
      path: '/api/companion'
    });
    
    wss.on('connection', (ws, req) => {
      console.log('🎛️ Companion module connected from:', req.socket.remoteAddress);
      companionClients.add(ws);
      
      // Send current status immediately
      if (lastStatusState) {
        ws.send(JSON.stringify({
          type: 'status_update',
          data: lastStatusState
        }));
      }
      
      // Send current presets list
      (async () => {
        try {
          if (fs.existsSync(USER_PRESETS_PATH)) {
            const json = await fs.promises.readFile(USER_PRESETS_PATH, 'utf-8');
            const presetsData = JSON.parse(json);
            ws.send(JSON.stringify({
              type: 'presets_updated',
              data: presetsData.presets || []
            }));
            console.log('🎛️ Sent presets to new Companion client');
          }
        } catch (e) {
          console.error('Failed to send presets to Companion:', e.message);
        }
      })();
      
      ws.on('message', async (message) => {
        try {
          const command = JSON.parse(message.toString());
          console.log('🎛️ Companion command:', command);
          
          let result = { ok: false };
          
          switch (command.action) {
            case 'trigger_clip':
              result = await triggerClip(parseInt(command.layer), parseInt(command.column));
              break;
              
            case 'trigger_column':
              result = await triggerColumn(parseInt(command.column));
              break;
              
            case 'cut_to_program':
              result = await cutToProgram();
              break;
              
            case 'clear_all':
              result = await clearAll();
              break;
              
            case 'execute_macro':
              if (command.macro && Array.isArray(command.macro)) {
                // Direct macro execution
                result = await executeMacro(command.macro);
              } else if (command.macroId) {
                // Look up macro by ID from user presets first, then fall back to config.json
                try {
                  let preset = null;
                  
                  // Try user presets first
                  if (fs.existsSync(USER_PRESETS_PATH)) {
                    const presetsData = JSON.parse(fs.readFileSync(USER_PRESETS_PATH, 'utf8'));
                    preset = presetsData.presets?.find(p => p.id === command.macroId);
                  }
                  
                  // Fall back to config.json if not found
                  if (!preset) {
                    const configPath = path.join(import.meta.dirname, 'public', 'config.json');
                    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    preset = configData.presets?.find(p => p.id === command.macroId);
                  }
                  
                  if (preset && preset.macro) {
                    console.log(`🎯 Executing preset: ${preset.label || preset.id}`);
                    
                    // Update active preset and broadcast to Companion
                    activePresetId = command.macroId;
                    const presetMessage = JSON.stringify({
                      type: 'preset_executing',
                      data: {
                        presetId: command.macroId,
                        label: preset.label || preset.id
                      },
                      timestamp: Date.now()
                    });
                    
                    companionClients.forEach(client => {
                      if (client.readyState === 1) {
                        try {
                          client.send(presetMessage);
                        } catch (error) {
                          console.error('🎛️ Failed to send preset execution state:', error);
                        }
                      }
                    });
                    
                    result = await executeMacro(preset.macro);
                    
                    // Clear active preset after short delay (allow visual feedback)
                    setTimeout(() => {
                      activePresetId = null;
                      const clearMessage = JSON.stringify({
                        type: 'preset_executing',
                        data: { presetId: null },
                        timestamp: Date.now()
                      });
                      companionClients.forEach(client => {
                        if (client.readyState === 1) {
                          try {
                            client.send(clearMessage);
                          } catch (error) {
                            // Silently ignore errors on cleanup
                          }
                        }
                      });
                    }, 500); // 500ms visual feedback
                    
                  } else {
                    result = { ok: false, error: `Preset '${command.macroId}' not found` };
                  }
                } catch (error) {
                  result = { ok: false, error: `Failed to load preset: ${error.message}` };
                }
              } else {
                result = { ok: false, error: 'No macro or macroId provided' };
              }
              break;
              
            case 'get_status':
              result = { ok: true, data: lastStatusState };
              break;
              
            default:
              result = { ok: false, error: `Unknown action: ${command.action}` };
          }
          
          // Send response back to Companion
          ws.send(JSON.stringify({
            type: 'command_response',
            id: command.id,
            result
          }));
          
        } catch (error) {
          console.error('🎛️ Companion command error:', error);
          ws.send(JSON.stringify({
            type: 'command_response',
            id: command.id || 'unknown',
            result: { ok: false, error: error.message }
          }));
        }
      });
      
      ws.on('close', () => {
        companionClients.delete(ws);
        console.log('🎛️ Companion module disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('🎛️ Companion WebSocket error:', error);
        companionClients.delete(ws);
      });
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`✖ Port ${PORT} is already in use`);
      } else {
        console.error("✖ Server error:", err);
      }
      process.exit(1);
    });
    server.listen(PORT, () => {
      console.log("\n🎬 ShowCall Server Started (OSC + REST Hybrid + NDI-OBS + Companion)");
      console.log("=".repeat(60));
      console.log(`📡 Web UI:     http://localhost:${PORT}`);
      console.log(`🎯 Resolume:   ${HOST}`);
      console.log(`🔗 REST API:   ${baseUrl()} (monitoring)`);
      console.log(`🎵 OSC Output: ${HOST}:${OSC_PORT} (control)`);
      console.log(`🎥 NDI:        Professional OBS WebSocket integration`);
      console.log(`🎛️ Companion:  ws://localhost:${PORT}/api/companion`);
      console.log(`🗂️ User data:  ${USER_DATA_DIR}`);
      if (MOCK) console.log("🎭 MOCK MODE (set MOCK=0 in .env to disable)");
      console.log("=".repeat(60));
      try { initOSC(); } catch {}
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      if (ndiBridge) {
        await ndiBridge.shutdown();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error("Fatal error during server initialization:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

initializeApp();
