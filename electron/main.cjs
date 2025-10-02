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
  const env = { 
    ...process.env, 
    PORT: UI_PORT,
    // Ensure the Electron binary runs Node semantics when executing server.js
    ELECTRON_RUN_AS_NODE: '1',
    NODE_ENV: app.isPackaged ? 'production' : (process.env.NODE_ENV || 'development'),
    // Provide app path so server can resolve packaged public/ assets
    RESOURCES_PATH: app.getAppPath()
  };
  
  // In production (packaged), use the unpacked server.js
  // In development, use the local server.js
  let serverPath = path.join(__dirname, "..", "server.js");
  if (app.isPackaged) {
    serverPath = serverPath.replace("app.asar", "app.asar.unpacked");
  }
  
  serverProcess = spawn(process.execPath, [serverPath], {
    env,
    stdio: "inherit",
    cwd: path.dirname(serverPath)
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
