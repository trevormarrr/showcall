// electron/main.cjs
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");
const waitOn = require("wait-on");

let serverProcess;
let mainWindow;
let deckWindow;
let created = false;
let updateCheckInterval = null;

// Configure autoUpdater
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.autoDownload = false; // Manual control
autoUpdater.autoInstallOnAppQuit = true;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

// Load user .env (same location server uses) so Electron can see RESOLUME_* values
function loadUserEnvIntoProcess() {
  try {
    const userDataDir = app.getPath('userData');
    const userEnvPath = path.join(userDataDir, '.env');
    if (fs.existsSync(userEnvPath)) {
      const content = fs.readFileSync(userEnvPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          const val = trimmed.slice(eq + 1).trim();
          if (!(key in process.env)) process.env[key] = val;
        }
      }
      console.log(`✅ Loaded user env into Electron from: ${userEnvPath}`);
    }
  } catch (e) {
    console.warn('⚠️ Failed to load user .env into Electron process:', e.message);
  }
}

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
    width: 1500,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    title: "ShowCall - Live Event Controller",
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

app.whenReady().then(async () => {
  try {
    // Ensure Electron process inherits user .env values (RESOLUME_HOST, ports, etc.)
    loadUserEnvIntoProcess();
    await ensureServer();      // <— do not spawn if already running
    await createWindowOnce();
    
    // Setup enhanced auto-updater system
    setupAutoUpdater();
  } catch (e) {
    console.error("Failed to load UI:", e);
    app.quit();
  }
});

// ---- Enhanced Auto-Updater ----
// ============================================
// AUTO-UPDATER SYSTEM (Enhanced)
// ============================================

function setupAutoUpdater() {
  console.log('🔄 Initializing enhanced auto-updater system...');
  
  // Don't check for updates in development
  if (!app.isPackaged) {
    console.log('⚠️ Auto-updater disabled in development mode');
    return;
  }
  
  // Initial check on startup (delayed 5 seconds)
  setTimeout(() => {
    console.log('🔍 Performing initial update check...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('❌ Initial update check failed:', err.message);
    });
  }, 5000);
  
  // Check for updates every 2 hours
  updateCheckInterval = setInterval(() => {
    console.log('🔍 Scheduled update check...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('❌ Scheduled update check failed:', err.message);
    });
  }, 2 * 60 * 60 * 1000);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
    sendToRenderer('update-checking');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('✅ Update available:', {
      version: info.version,
      releaseDate: info.releaseDate,
      size: info.files?.[0]?.size
    });
    
    // Send detailed info to renderer
    sendToRenderer('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
      releaseName: info.releaseName,
      size: formatBytes(info.files?.[0]?.size || 0)
    });
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('ℹ️ No updates available. Current version:', info.version);
    sendToRenderer('update-not-available', {
      version: info.version
    });
  });
  
  autoUpdater.on('error', (error) => {
    console.error('❌ Auto-updater error:', error);
    sendToRenderer('update-error', {
      message: error.message,
      stack: error.stack
    });
  });
  
  autoUpdater.on('download-progress', (progress) => {
    const logMessage = `📥 Downloading: ${Math.round(progress.percent)}% ` +
                      `(${formatBytes(progress.bytesPerSecond)}/s) ` +
                      `${formatBytes(progress.transferred)}/${formatBytes(progress.total)}`;
    console.log(logMessage);
    
    sendToRenderer('update-download-progress', {
      percent: Math.round(progress.percent),
      transferred: formatBytes(progress.transferred),
      total: formatBytes(progress.total),
      speed: formatBytes(progress.bytesPerSecond) + '/s'
    });
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Update downloaded successfully. Version:', info.version);
    
    sendToRenderer('update-downloaded', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseName: info.releaseName
    });
    
    // Show native dialog
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready to Install',
      message: `ShowCall v${info.version} has been downloaded.`,
      detail: 'The update will be installed when you close the application, or you can restart now.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        console.log('🔄 User chose to restart now...');
        autoUpdater.quitAndInstall(false, true);
      } else {
        console.log('⏰ User chose to install later');
      }
    });
  });
}

// ============================================
// IPC HANDLERS FOR RENDERER
// ============================================

ipcMain.handle('check-for-updates', async () => {
  console.log('🔄 Manual update check requested by user');
  
  if (!app.isPackaged) {
    return {
      success: false,
      error: 'Updates only work in production builds'
    };
  }
  
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      success: true,
      updateInfo: result?.updateInfo
    };
  } catch (error) {
    console.error('❌ Manual update check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('download-update', async () => {
  console.log('📥 User requested to download update');
  
  if (!app.isPackaged) {
    return {
      success: false,
      error: 'Updates only work in production builds'
    };
  }
  
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('❌ Download failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('install-update', () => {
  console.log('🔄 User requested to install update now');
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-release-notes', (event, version) => {
  const url = `https://github.com/trevormarrr/showcall/releases/tag/v${version}`;
  shell.openExternal(url);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function sendToRenderer(channel, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================
// CLEANUP
// ============================================

app.on('before-quit', () => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
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
