// electron/main.cjs
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
let autoUpdater;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch (e) {
  console.warn('electron-updater not available in dev:', e.message);
}
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const waitOn = require("wait-on");

let serverProcess;
let mainWindow;
let deckWindow;
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
    // Development: use current node/electron
    serverPath = path.join(__dirname, "..", "server.mjs");
    nodeExecutable = process.execPath;
    spawnEnv = { 
      ...process.env, 
      PORT: UI_PORT,
      NODE_ENV: 'development',
      RESOURCES_PATH: path.join(__dirname, "..")
    };
  } else {
    // Production: use Electron as Node with ELECTRON_RUN_AS_NODE
    serverPath = path.join(process.resourcesPath, "app.asar.unpacked", "server.mjs");
    nodeExecutable = process.execPath;
    spawnEnv = { 
      ...process.env, 
      PORT: UI_PORT,
      NODE_ENV: 'production',
      ELECTRON_RUN_AS_NODE: '1',
      RESOURCES_PATH: process.resourcesPath
    };
    // Remove any dev-specific env vars that might interfere
    delete spawnEnv.npm_config_cache;
    delete spawnEnv.npm_config_prefix;
  }
  
  console.log(`Starting server (isDev: ${isDev})`);
  console.log(`- Executable: ${nodeExecutable}`);
  console.log(`- Server path: ${serverPath}`);
  console.log(`- Resources path: ${spawnEnv.RESOURCES_PATH}`);
  console.log(`- NODE_ENV: ${spawnEnv.NODE_ENV}`);
  console.log(`- ELECTRON_RUN_AS_NODE: ${spawnEnv.ELECTRON_RUN_AS_NODE || 'undefined'}`);
  
  serverProcess = spawn(nodeExecutable, [serverPath], {
    env: spawnEnv,
    stdio: ["inherit", "inherit", "inherit"]
  });
  
  serverProcess.on("exit", (code, signal) => {
    console.error(`Server process exited with code ${code}, signal ${signal}`);
    serverProcess = null;
    if (code !== 0 && app && !app.isQuitting) {
      const errorMsg = `Server crashed: server.mjs exited (${signal || code})\n\nDebugging info:\n- isDev: ${isDev}\n- Server path: ${serverPath}\n- Resources path: ${spawnEnv.RESOURCES_PATH}\n- NODE_ENV: ${spawnEnv.NODE_ENV}`;
      console.error(errorMsg);
      dialog.showErrorBox("Server Crashed", errorMsg);
    }
  });
  
  serverProcess.on("error", (error) => {
    console.error(`Server process error:`, error);
    if (!app.isQuitting) {
      dialog.showErrorBox("Server Failed to Start", `Failed to start server process: ${error.message}`);
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
    webPreferences: { 
      nodeIntegration: false, 
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  await mainWindow.loadURL(UI_URL);

  mainWindow.on("closed", () => {
    mainWindow = null;
    created = false;
  });
}

// ---- Preset Deck Window ----
function createDeckWindow() {
  if (deckWindow && !deckWindow.isDestroyed()) {
    deckWindow.focus();
    return;
  }

  deckWindow = new BrowserWindow({
    width: 300,
    height: 600,
    title: "ShowCall - Preset Deck",
    backgroundColor: "#0b0f14",
    alwaysOnTop: true,
    resizable: true,
    minimizable: true,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // Load the deck page
  deckWindow.loadURL(`http://localhost:${process.env.PORT || 3200}/deck.html`);

  deckWindow.on("closed", () => {
    deckWindow = null;
  });

  // Remove menu bar
  deckWindow.setMenuBarVisibility(false);
}

// ---- IPC Handlers ----
ipcMain.handle('open-deck-window', () => {
  createDeckWindow();
});

ipcMain.handle('close-deck-window', () => {
  if (deckWindow && !deckWindow.isDestroyed()) {
    deckWindow.close();
  }
});

ipcMain.handle('check-for-updates', () => {
  if (autoUpdater) {
    console.log('🔄 Manual update check requested');
    autoUpdater.checkForUpdatesAndNotify();
    return true;
  }
  return false;
});

app.whenReady().then(async () => {
  try {
    await ensureServer();      // <— do not spawn if already running
    await createWindowOnce();
    
    // Enhanced Auto-updater Setup
    if (autoUpdater && !process.env.DISABLE_AUTO_UPDATER) {
      setupAutoUpdater();
    }
  } catch (e) {
    console.error("Failed to load UI:", e);
    app.quit();
  }
});

// ---- Enhanced Auto-Updater ----
function setupAutoUpdater() {
  console.log('🔄 Setting up auto-updater...');
  
  // Configure auto-updater
  autoUpdater.autoDownload = true; // Enable automatic downloads
  autoUpdater.autoInstallOnAppQuit = true; // Install when app quits
  
  // Check for updates every 30 minutes
  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 5 * 60 * 1000); // 5 minutes for testing (was 30 minutes)
  
  // Event handlers
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('✅ Update available:', info.version);
    // Show non-intrusive notification to user
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('ℹ️ No updates available. Current version:', info.version);
    // Send to renderer for manual check feedback
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available', info);
    }
  });
  
  autoUpdater.on('error', (err) => {
    console.error('❌ Auto-updater error:', err);
    // Send error to renderer for user notification
    if (mainWindow) {
      mainWindow.webContents.send('update-error', { 
        message: err.message,
        type: 'update-check-failed'
      });
    }
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    const logMessage = `📥 Download progress: ${Math.round(progressObj.percent)}% (${progressObj.bytesPerSecond}/s)`;
    console.log(logMessage);
    
    // Send progress to renderer
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressObj);
    }
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Update downloaded, will install on quit. Version:', info.version);
    
    // Notify user that update is ready
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
    
    // Show dialog asking if user wants to restart now
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `ShowCall v${info.version} is ready to install.`,
      detail: 'The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

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
