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
      contextIsolation: false, // For simple local file access if needed
      webSecurity: false // Allow loading local resources freely
    },
    // icon: path.join(__dirname, 'icon.ico') // Uncomment if you have an icon
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Auto-Update Configuration
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  function checkForUpdates() {
    if (!mainWindow) return;
    // Check internet connection or just rely on autoUpdater's error handling
    autoUpdater.checkForUpdates().catch(err => {
      console.log('Update check failed (likely offline):', err);
    });
  }

  // Check for updates once the window is ready
  mainWindow.once('ready-to-show', () => {
    // Wait a bit to ensure potential network connection is established
    setTimeout(() => {
      checkForUpdates();
    }, 3000);
  });

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
      mainWindow.webContents.send('update_status', 'downloaded'); // Update status text
      mainWindow.webContents.send('update_downloaded'); // Trigger existing toast
    }
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  ipcMain.on('check_update', () => {
    autoUpdater.checkForUpdates();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
