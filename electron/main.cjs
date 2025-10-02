// electron/main.cjs
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const waitOn = require("wait-on");

let serverProcess;
let mainWindow;
let created = false;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

// ---- Single-instance lock ----
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

const UI_PORT = process.env.PORT || "3200";
const UI_URL = `http://localhost:${UI_PORT}`;

// Quick probe to see if something is already listening
function isServerUp(url) {
  return new Promise((resolve) => {
    const req = http.get(url + "/health", { timeout: 600 }, (res) => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  const isDev = !app.isPackaged;
  
  let serverPath;
  let nodeExecutable;
  let spawnEnv;
  
  if (isDev) {
    // Development: use node directly
    serverPath = path.join(__dirname, "..", "server.js");
    nodeExecutable = process.execPath;
    spawnEnv = { 
      ...process.env, 
      PORT: UI_PORT,
      NODE_ENV: 'development',
      RESOURCES_PATH: path.join(__dirname, "..")
    };
  } else {
    // Production: use Electron as Node with ELECTRON_RUN_AS_NODE
    serverPath = path.join(process.resourcesPath, "app.asar.unpacked", "server.js");
    nodeExecutable = process.execPath;
    spawnEnv = { 
      ...process.env, 
      PORT: UI_PORT,
      NODE_ENV: 'production',
      ELECTRON_RUN_AS_NODE: '1',
      RESOURCES_PATH: process.resourcesPath
    };
  }
  
  console.log(`Starting server: ${nodeExecutable} ${serverPath}`);
  console.log(`Resources path: ${spawnEnv.RESOURCES_PATH}`);
  
  serverProcess = spawn(nodeExecutable, [serverPath], {
    env: spawnEnv,
    stdio: ["inherit", "inherit", "inherit"]
  });
  serverProcess.on("exit", (code, signal) => {
    serverProcess = null;
    if (code !== 0 && app && !app.isQuitting) {
      dialog.showErrorBox("Server crashed", `server.js exited (${signal || code}).`);
    }
  });
}

async function ensureServer() {
  const alreadyUp = await isServerUp(UI_URL);
  if (!alreadyUp) startServer();
  // Wait until the server is ready (either existing or the one we just spawned)
  await waitOn({ resources: [UI_URL], timeout: 20000, validateStatus: s => s >= 200 && s < 500 });
}

async function createWindowOnce() {
  if (created) return;
  created = true;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "ShowCall",
    backgroundColor: "#0b0f14",
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  await mainWindow.loadURL(UI_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
    created = false;
  });
}

app.whenReady().then(async () => {
  try {
    await ensureServer();      // <— do not spawn if already running
    await createWindowOnce();
  } catch (e) {
    console.error("Failed to load UI:", e);
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindowOnce();
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (serverProcess && !serverProcess.killed) {
    try { serverProcess.kill(); } catch {}
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
