// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDeckWindow: () => ipcRenderer.invoke('open-deck-window'),
  closeDeckWindow: () => ipcRenderer.invoke('close-deck-window'),
  
  // Auto-updater events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});