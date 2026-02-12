const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow loading local resources
    },
    // icon: path.join(__dirname, 'icon.ico')
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Check for updates once the window is ready
  mainWindow.once('ready-to-show', () => {
    // Send environment info to renderer
    // In production with extraResources, cmaps are in resources/cmaps
    // In dev, they are in libs/cmaps (relative to index.html)
    // We can rely on renderer logic, or send paths here.
    // For now, let's just trigger the update check.
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.log('Update check failed (likely offline):', err);
      });
    }, 3000);
  });
}

// Auto-Update Configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) mainWindow.webContents.send('update_status', 'checking');
});

autoUpdater.on('update-available', () => {
  if (mainWindow) mainWindow.webContents.send('update_status', 'available');
  console.log('Update available. Downloading...');
});

autoUpdater.on('update-not-available', () => {
  if (mainWindow) mainWindow.webContents.send('update_status', 'not_available');
});

autoUpdater.on('error', (err) => {
  console.log('Auto-updater error:', err);
  if (mainWindow) mainWindow.webContents.send('update_status', 'error', err.message);
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update_status', 'downloaded');
    mainWindow.webContents.send('update_downloaded');
  }
});

// IPC Handlers
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.on('check_update', () => {
  autoUpdater.checkForUpdates();
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
