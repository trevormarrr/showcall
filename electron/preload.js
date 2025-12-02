// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDeckWindow: () => ipcRenderer.invoke('open-deck-window'),
  closeDeckWindow: () => ipcRenderer.invoke('close-deck-window'),
  
  // Auto-updater events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  
  // Manual update check
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});