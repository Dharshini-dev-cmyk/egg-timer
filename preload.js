// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  onShowCloseConfirmation: (callback) => {
    ipcRenderer.on('show-close-confirmation', callback);
  },

  confirmClose: () => {
    ipcRenderer.send('confirm-close');
  },

  cancelClose: () => {
    ipcRenderer.send('cancel-close');
  },

  minimizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },

  toggleMaximize: () => {
    ipcRenderer.send('toggle-maximize-window');
  },

  onMaximizeChange: (callback) => {
    ipcRenderer.on('maximize-change', callback);
  }

});