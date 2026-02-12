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
  autoUpdater.on('update-available', () => {
    // Silent: Do not notify user yet, just let it download
    console.log('Update available. Downloading...');
  });

  autoUpdater.on('update-downloaded', () => {
    // Now notify the user that the update is ready
    if (mainWindow) {
      mainWindow.webContents.send('update_downloaded');
    }
  });

  autoUpdater.on('error', (err) => {
    console.log('Auto-updater error:', err);
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall(false, true); // silent=false, forceRunAfter=true
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
