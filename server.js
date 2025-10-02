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

// Load .env from working directory first
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// User-writable config directory
const USER_DATA_DIR = process.env.SERVER_USER_DATA
  || (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support', 'ShowCall')
      : process.platform === 'win32'
        ? path.join(os.homedir(), 'AppData', 'Roaming', 'ShowCall')
        : path.join(os.homedir(), '.showcall'));
try { fs.mkdirSync(USER_DATA_DIR, { recursive: true }); } catch {}

// Try to load .env from a user-writable location if not already provided
const USER_ENV_PATH = path.join(USER_DATA_DIR, '.env');
if (!process.env.RESOLUME_HOST) {
  if (fs.existsSync(USER_ENV_PATH)) {
    console.log(`Loading user config from: ${USER_ENV_PATH}`);
    dotenv.config({ path: USER_ENV_PATH, override: false });
  } else {
    // Seed a default .env file for users to edit
    console.log(`Creating default config at: ${USER_ENV_PATH}`);
    const defaultEnv = `PORT=3200\nRESOLUME_HOST=localhost\nRESOLUME_REST_PORT=8080\nRESOLUME_OSC_PORT=7000\nMOCK=0\n`;
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
  const candidates = [
    // dev
    path.join(__dirname, 'public'),
    path.join(process.cwd(), 'public'),
    // packaged context: RESOURCES_PATH provided by Electron main
    process.env.RESOURCES_PATH && path.join(process.env.RESOURCES_PATH, 'public')
  ].filter(Boolean);
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return null;
}

const PUBLIC_DIR = resolvePublicDir();
if (PUBLIC_DIR) {
  app.use(express.static(PUBLIC_DIR));
  console.log(`✅ Serving UI from: ${PUBLIC_DIR}`);
} else {
  console.error('❌ Public directory not found; UI assets may not load.');
  console.log('Checked paths:', [
    path.join(__dirname, 'public'),
    path.join(process.cwd(), 'public'),
    process.env.RESOURCES_PATH && path.join(process.env.RESOURCES_PATH, 'public')
  ].filter(Boolean));
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
      localPort: 57121, // Local port for our app
      remoteAddress: HOST,
      remotePort: parseInt(OSC_PORT),
      metadata: true
    });

    oscPort.on("ready", () => {
      console.log(`✅ OSC ready - sending to ${HOST}:${OSC_PORT}`);
      isOSCConnected = true;
    });

    oscPort.on("error", (error) => {
      console.error("❌ OSC Error:", error.message);
      isOSCConnected = false;
    });

    oscPort.on("message", (oscMsg) => {
      // Log incoming OSC messages (if Resolume sends any back)
      console.log("📨 OSC received:", oscMsg.address, oscMsg.args);
    });

    oscPort.open();
    
  } catch (error) {
    console.error("❌ Failed to initialize OSC:", error.message);
    isOSCConnected = false;
  }
}

// Send OSC message to Resolume
function sendOSC(address, value = 1) {
  if (MOCK) {
    console.log(`🎭 MOCK OSC: ${address} ${value}`);
    return Promise.resolve({ ok: true });
  }

  if (!oscPort) {
    return Promise.reject(new Error("OSC not initialized"));
  }

  return new Promise((resolve, reject) => {
    try {
      const message = {
        address: address,
        args: [
          {
            type: "i", // integer
            value: value
          }
        ]
      };

      console.log(`🎵 OSC → ${address} ${value}`);
      oscPort.send(message);
      
      // OSC is fire-and-forget, assume success
      resolve({ ok: true });
      
    } catch (error) {
      console.error(`❌ OSC send failed:`, error.message);
      reject(error);
    }
  });
}

// HTTP helpers using official Resolume REST API format
async function resolumeRequest(method, path, data = null) {
  const url = `${baseUrl()}${path}`;
  const config = {
    method,
    url,
    timeout: 5000,
    headers: {
      'Accept': 'application/json'
    }
  };
  
  // Resolume expects JSON body for PUT/POST requests
  if (data !== null && (method === 'PUT' || method === 'POST')) {
    config.headers['Content-Type'] = 'application/json';
    config.data = JSON.stringify(data);
  }
  
  try {
    console.log(`🔗 ${method} ${url}`, data !== null ? JSON.stringify(data) : '');
    const response = await axios(config);
    isResolumeConnected = true;
    lastConnectionCheck = Date.now();
    console.log(`✅ Response: ${response.status}`);
    return response.data;
  } catch (error) {
    isResolumeConnected = false;
    const errorMsg = error.response?.data?.error || error.response?.statusText || error.message;
    console.error(`❌ Resolume ${method} ${path} failed:`, {
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
        {
          name: "Background",
          clips: [
            { name: "Walk-In BG", connected: { value: 0 } },
            { name: "Sermon BG", connected: { value: 1 } },
            { name: "Baptism BG", connected: { value: 0 } }
          ]
        },
        {
          name: "Video Feed", 
          clips: [
            { name: "NDI Feed", connected: { value: 0 } },
            { name: "Camera 1", connected: { value: 1 } },
            { name: "Baptism Cam", connected: { value: 0 } }
          ]
        }
      ],
      transport: { bpm: { value: 120 } }
    };
  }
  
  try {
    return await resolumeRequest('GET', '/api/v1/composition');
  } catch (error) {
    throw new Error(`Failed to get composition: ${error.message}`);
  }
}

// Parse Resolume composition data using official API structure
function parseCompositionStatus(data) {
  if (!data) return getDefaultStatus();
  
  try {
    let programClip = null;
    let previewClip = null;
    
    // Resolume API returns layers array with clips array
    // connected.value > 0 means the clip is active
    if (data.layers && Array.isArray(data.layers)) {
      data.layers.forEach((layer, layerIdx) => {
        if (layer.clips && Array.isArray(layer.clips)) {
          layer.clips.forEach((clip, clipIdx) => {
            // Check if clip is connected (active)
            if (clip && clip.connected && clip.connected.value > 0) {
              const clipInfo = {
                layer: layerIdx + 1, // Convert back to 1-based for UI
                column: clipIdx + 1,
                clipName: clip.name?.value || `Clip ${clipIdx + 1}`,
                layerName: layer.name?.value || `Layer ${layerIdx + 1}`
              };
              
              // In Resolume, check if clip is playing (program) or just selected (preview)
              // Note: This depends on your Resolume settings (deck A vs B)
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
    
    // Extract BPM from tempo controller
    let bpm = "—";
    if (data.tempocontroller && data.tempocontroller.tempo && typeof data.tempocontroller.tempo.value === 'number') {
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

// Get full composition structure with all clip names
app.get("/api/composition", async (req, res) => {
  try {
    console.log("🔍 Fetching composition structure...");
    
    const composition = await resolumeRequest('GET', '/api/v1/composition');
    
    // Helper to safely extract string value
    const getStringValue = (obj) => {
      if (!obj) return null;
      if (typeof obj === 'string') return obj;
      if (obj.value && typeof obj.value === 'string') return obj.value;
      return null;
    };
    
    // Build a clean structure with all clip info
    const structure = {
      connected: true,
      compositionName: getStringValue(composition.name) || "Unknown",
      layers: composition.layers?.map((layer, layerIdx) => ({
        id: layerIdx + 1, // 1-based for UI
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
    
    console.log(`✅ Composition: ${structure.compositionName}, ${structure.layers.length} layers, ${structure.maxColumns} columns`);
    res.json(structure);
  } catch (error) {
    console.error("❌ Failed to get composition:", error.message);
    res.status(500).json({
      connected: false,
      error: error.message,
      hint: "Make sure Resolume is running and REST API is enabled",
      timestamp: Date.now()
    });
  }
});

// Debug endpoint for detailed info
app.get("/api/debug", async (req, res) => {
  try {
    console.log("🔍 Debug: Testing Resolume connection...");
    
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
        clipCount: layer.clips?.length || 0,
        clips: layer.clips?.slice(0, 10).map((clip, clipIdx) => ({
          apiIndex: clipIdx,
          uiIndex: clipIdx + 1,
          name: clip.name?.value || clip.name || null,
          connected: clip.connected?.value || 0,
          isEmpty: !clip.name?.value && !clip.name
        })) || []
      })) || [],
      timestamp: Date.now()
    };
    
    console.log("✅ Resolume connected:", debugInfo.compositionName);
    res.json(debugInfo);
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    res.status(500).json({
      connected: false,
      error: error.message,
      resolumeUrl: baseUrl(),
      hint: "Make sure Resolume is running and REST API is enabled in Preferences > Web Server",
      timestamp: Date.now()
    });
  }
});

// Trigger clip via OSC
async function triggerClip(layer, column) {
  if (MOCK) {
    console.log(`MOCK: Triggering L${layer}C${column}`);
    return { ok: true, action: "trigger", layer, column };
  }
  
  try {
    console.log(`🎯 Triggering Layer ${layer} Column ${column} via OSC`);
    
    // OSC uses 1-based indexing (same as UI)
    const oscAddress = `/composition/layers/${layer}/clips/${column}/connect`;
    await sendOSC(oscAddress, 1);
    
    console.log(`✅ Sent OSC trigger for L${layer}C${column}`);
    return { ok: true, action: "trigger", layer, column, method: "osc" };
    
  } catch (error) {
    console.error(`❌ Failed to trigger L${layer}C${column}:`, error.message);
    return { ok: false, error: error.message, action: "trigger", layer, column };
  }
}

// Trigger column via OSC
async function triggerColumn(column) {
  if (MOCK) {
    console.log(`MOCK: Triggering column ${column}`);
    return { ok: true, action: "triggerColumn", column };
  }
  
  try {
    console.log(`🎯 Triggering Column ${column} via OSC`);
    
    // OSC supports column triggering directly (1-based indexing)
    const oscAddress = `/composition/columns/${column}/connect`;
    await sendOSC(oscAddress, 1);
    
    console.log(`✅ Sent OSC trigger for Column ${column}`);
    return { ok: true, action: "triggerColumn", column, method: "osc" };
    
  } catch (error) {
    console.error(`❌ Failed to trigger column ${column}:`, error.message);
    return { ok: false, error: error.message, action: "triggerColumn", column };
  }
}

// Cut/Resync via OSC
async function cutToProgram() {
  if (MOCK) {
    console.log("MOCK: Cut to program");
    return { ok: true, action: "cut" };
  }
  
  try {
    console.log(`🎬 Cutting to program via OSC...`);
    
    // OSC: Trigger resync on tempo controller
    await sendOSC("/composition/tempocontroller/resync", 1);
    
    console.log("✅ Cut/Resync sent");
    return { ok: true, action: "cut", method: "osc" };
    
  } catch (error) {
    console.error("❌ Failed to cut:", error.message);
    return { ok: false, error: error.message, action: "cut" };
  }
}

// Clear all clips via OSC
async function clearAll() {
  if (MOCK) {
    console.log("MOCK: Clear all");
    return { ok: true, action: "clear" };
  }
  
  try {
    console.log(`🧹 Clearing all clips via OSC...`);
    
    // OSC: Disconnect all clips
    await sendOSC("/composition/disconnectall", 1);
    
    console.log("✅ Clear all sent");
    return { ok: true, action: "clear", method: "osc" };
    
  } catch (error) {
    console.error("❌ Failed to clear all:", error.message);
    return { ok: false, error: error.message, action: "clear" };
  }
}

// Test endpoint using OSC
app.post("/api/test-trigger", async (req, res) => {
  const { layer = 1, column = 1 } = req.body;
  
  try {
    console.log(`🔍 Testing L${layer}C${column} via OSC`);
    
    const result = await triggerClip(layer, column);
    
    res.json({ 
      layer, 
      column, 
      success: result.ok,
      method: 'OSC',
      oscAddress: `/composition/layers/${layer}/clips/${column}/connect`,
      ...result
    });
    
  } catch (error) {
    console.log(`❌ Test trigger failed: ${error.message}`);
    res.json({ 
      layer, 
      column, 
      success: false,
      error: error.message
    });
  }
});

// Test column trigger via OSC
app.post("/api/test-column", async (req, res) => {
  const { column = 1 } = req.body;
  
  try {
    console.log(`🔍 Testing Column ${column} via OSC`);
    
    const result = await triggerColumn(column);
    
    res.json({ 
      column, 
      success: result.ok,
      method: 'OSC',
      oscAddress: `/composition/columns/${column}/connect`,
      ...result
    });
    
  } catch (error) {
    console.log(`❌ Test column trigger failed: ${error.message}`);
    res.json({ 
      column, 
      success: false,
      error: error.message
    });
  }
});

// Check Resolume connection (REST for monitoring, OSC for control)
async function checkConnection() {
  if (MOCK) return { 
    connected: true, 
    osc: true,
    host: "MOCK", 
    restPort: "MOCK",
    oscPort: "MOCK"
  };
  
  const now = Date.now();
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return { 
      connected: isResolumeConnected,
      osc: isOSCConnected,
      host: HOST, 
      restPort: REST_PORT,
      oscPort: OSC_PORT
    };
  }
  
  try {
    await resolumeRequest('GET', '/api/v1/composition');
    return { 
      connected: true,
      osc: isOSCConnected,
      host: HOST, 
      restPort: REST_PORT,
      oscPort: OSC_PORT
    };
  } catch (error) {
    return { 
      connected: false,
      osc: isOSCConnected,
      host: HOST, 
      restPort: REST_PORT,
      oscPort: OSC_PORT,
      error: error.message 
    };
  }
}

// Macro execution
async function executeMacro(steps) {
  const results = [];
  
  for (const [index, step] of steps.entries()) {
    try {
      let result;
      
      switch (step.type?.toLowerCase()) {
        case 'trigger':
          result = await triggerClip(step.layer, step.column);
          break;
        case 'triggercolumn':
          result = await triggerColumn(step.column);
          break;
        case 'cut':
          result = await cutToProgram();
          break;
        case 'clear':
          result = await clearAll();
          break;
        case 'sleep':
          await new Promise(r => setTimeout(r, step.ms || 100));
          result = { ok: true, action: 'sleep', ms: step.ms || 100 };
          break;
        default:
          result = { ok: false, error: `Unknown step type: ${step.type}` };
      }
      
      results.push({ step: index + 1, ...result });
      
      if (!result.ok && step.critical !== false) {
        console.warn(`Macro step ${index + 1} failed, stopping`);
        break;
      }
      
    } catch (error) {
      results.push({ 
        step: index + 1, 
        ok: false, 
        error: error.message,
        action: step.type 
      });
      break;
    }
  }
  
  return results;
}

// API Endpoints
app.get("/health", async (req, res) => {
  const connection = await checkConnection();
  res.json({ 
    ok: true, 
    resolume: connection.connected,
    host: connection.host,
    port: connection.port,
    timestamp: Date.now()
  });
});

app.get("/api/connection", async (req, res) => {
  const connection = await checkConnection();
  res.json(connection);
});

app.post("/api/trigger", async (req, res) => {
  const { layer, column } = req.body;
  if (!layer || !column) {
    return res.status(400).json({ ok: false, error: "Missing layer or column" });
  }
  
  const result = await triggerClip(parseInt(layer), parseInt(column));
  res.json(result);
});

app.post("/api/triggerColumn", async (req, res) => {
  const { column } = req.body;
  if (!column) {
    return res.status(400).json({ ok: false, error: "Missing column" });
  }
  
  const result = await triggerColumn(parseInt(column));
  res.json(result);
});

app.post("/api/cut", async (req, res) => {
  const result = await cutToProgram();
  res.json(result);
});

app.post("/api/clear", async (req, res) => {
  const result = await clearAll();
  res.json(result);
});

app.post("/api/macro", async (req, res) => {
  const { macro = [], id, name } = req.body;
  
  if (!Array.isArray(macro) || macro.length === 0) {
    return res.status(400).json({ ok: false, error: "Invalid macro" });
  }
  
  console.log(`Executing macro "${name || id}" with ${macro.length} steps`);
  const results = await executeMacro(macro);
  
  res.json({ 
    ok: true, 
    id, 
    name,
    results,
    totalSteps: macro.length
  });
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
  
  req.on("close", () => {
    isActive = false;
    clearInterval(timer);
  });
  
  req.on("error", (error) => {
    isActive = false;
    clearInterval(timer);
    console.error("SSE error:", error.message);
  });
});

// Serve frontend
app.use((req, res) => {
  if (PUBLIC_DIR) {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  } else {
    res.status(500).send('UI not available');
  }
});

// Start server
const PORT = process.env.PORT || 3200;
const server = http.createServer(app);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("\n🎬 ShowCall Server Started (OSC + REST Hybrid)");
  console.log("=" .repeat(60));
  console.log(`📡 Web UI:     http://localhost:${PORT}`);
  console.log(`🎯 Resolume:   ${HOST}`);
  console.log(`🔗 REST API:   ${baseUrl()} (monitoring)`);
  console.log(`🎵 OSC Output: ${HOST}:${OSC_PORT} (control)`);
  console.log(`🗂️ User data:  ${USER_DATA_DIR}`);
  if (MOCK) console.log("🎭 MOCK MODE (set MOCK=0 in .env to disable)");
  console.log("=" .repeat(60));
  console.log("\n💡 Resolume Setup Required:");
  console.log("   1. Preferences > Web Server > ✓ Enable Web Server");
  console.log("   2. Preferences > OSC > ✓ Enable OSC Input (Port 7000)");
  console.log("\n🚀 OSC for Control | REST for Monitoring\n");
  
  // Initialize OSC
  initOSC();
});
