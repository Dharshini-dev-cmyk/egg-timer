// main.js

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;
let closeConfirmed = false;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,

    minWidth: 1100,
    minHeight: 700,

    title: 'Egg Timer <3',

    icon: path.join(__dirname, 'icon.png'),

    backgroundColor: '#170a38',

    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {

    if (closeConfirmed) {
      return;
    }

    event.preventDefault();

    mainWindow.webContents.send('show-close-confirmation');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Keep the renderer's maximize button glyph (□ / ❐) in sync.
  mainWindow.on('maximize', () => {
    if (mainWindow) {
      mainWindow.webContents.send('maximize-change', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow) {
      mainWindow.webContents.send('maximize-change', false);
    }
  });
}

ipcMain.on('confirm-close', () => {

  closeConfirmed = true;

  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('cancel-close', () => {
  closeConfirmed = false;
});

// ── Window controls (renderer titlebar buttons) ──────────────
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('toggle-maximize-window', () => {
  if (!mainWindow) return;

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

// No application menu: stops Electron's built-in Ctrl +/- / 0 zoom
// accelerators from double-firing with the in-app super-zoom.
Menu.setApplicationMenu(null);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});