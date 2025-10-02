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
        { name: "Background", clips: [
          { name: "Walk-In BG", connected: { value: 0 } },
          { name: "Sermon BG", connected: { value: 1 } },
          { name: "Baptism BG", connected: { value: 0 } }
        ]},
        { name: "Video Feed", clips: [
          { name: "NDI Feed", connected: { value: 0 } },
          { name: "Camera 1", connected: { value: 1 } },
          { name: "Baptism Cam", connected: { value: 0 } }
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
    let programClip = null;
    let previewClip = null;
    if (data.layers && Array.isArray(data.layers)) {
      data.layers.forEach((layer, layerIdx) => {
        if (layer.clips && Array.isArray(layer.clips)) {
          layer.clips.forEach((clip, clipIdx) => {
            if (clip && clip.connected && clip.connected.value > 0) {
              const clipInfo = {
                layer: layerIdx + 1,
                column: clipIdx + 1,
                clipName: clip.name?.value || `Clip ${clipIdx + 1}`,
                layerName: layer.name?.value || `Layer ${layerIdx + 1}`
              };
              if (clip.video && clip.video.opacity && clip.video.opacity.value > 0) {
                programClip = clipInfo;
              } else {
                previewClip = clipInfo;
              }
            }
          });
        }
      });
    }
    let bpm = "—";
    if (data.tempocontroller?.tempo && typeof data.tempocontroller.tempo.value === 'number') {
      bpm = Math.round(data.tempocontroller.tempo.value);
    }
    return {
      program: programClip || { layer: "—", column: "—", clipName: "—", layerName: "—" },
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
  if (!Array.isArray(macro) || macro.length === 0) {
    return res.status(400).json({ ok: false, error: "Invalid macro" });
  }
  const results = await executeMacro(macro);
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

// Presets API
app.get('/api/presets', async (req, res) => {
  try {
    if (fs.existsSync(USER_PRESETS_PATH)) {
      const json = await fs.promises.readFile(USER_PRESETS_PATH, 'utf-8');
      return res.json(JSON.parse(json));
    }
    // fallback to packaged/public config.json
    const fallback = path.join(PUBLIC_DIR || __dirname, 'config.json');
    const json = await fs.promises.readFile(fallback, 'utf-8');
    return res.json(JSON.parse(json));
  } catch (e) {
    console.error('Failed to load presets:', e.message);
    res.status(500).json({ presets: [], quickCues: [], error: e.message });
  }
});

app.post('/api/presets', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    await fs.promises.writeFile(USER_PRESETS_PATH, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (e) {
    console.error('Failed to save presets:', e.message);
    res.status(500).json({ ok: false, error: e.message });
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
      res.write(`data: ${JSON.stringify(status)}\n\n`);
    } catch (error) {
      const errorStatus = { ...getDefaultStatus(), error: error.message };
      res.write(`data: ${JSON.stringify(errorStatus)}\n\n`);
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

    // Start server
    const PORT = process.env.PORT || 3200;
    const server = http.createServer(app);
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`✖ Port ${PORT} is already in use`);
      } else {
        console.error("✖ Server error:", err);
      }
      process.exit(1);
    });
    server.listen(PORT, () => {
      console.log("\n🎬 ShowCall Server Started (OSC + REST Hybrid)");
      console.log("=".repeat(60));
      console.log(`📡 Web UI:     http://localhost:${PORT}`);
      console.log(`🎯 Resolume:   ${HOST}`);
      console.log(`🔗 REST API:   ${baseUrl()} (monitoring)`);
      console.log(`🎵 OSC Output: ${HOST}:${OSC_PORT} (control)`);
      console.log(`🗂️ User data:  ${USER_DATA_DIR}`);
      if (MOCK) console.log("🎭 MOCK MODE (set MOCK=0 in .env to disable)");
      console.log("=".repeat(60));
      try { initOSC(); } catch {}
    });
  } catch (error) {
    console.error("Fatal error during server initialization:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

initializeApp();
