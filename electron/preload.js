// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDeckWindow: () => ipcRenderer.invoke('open-deck-window'),
  closeDeckWindow: () => ipcRenderer.invoke('close-deck-window')
});