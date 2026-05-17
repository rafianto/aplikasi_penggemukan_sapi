const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database/db');

let db;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Penggemukan Sapi Terpadu',
    icon: path.join(__dirname, 'renderer', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  db = new Database();
  db.initialize();

  // === SAPI ===
  ipcMain.handle('sapi:getAll', () => db.getAllSapi());
  ipcMain.handle('sapi:getById', (_, id) => db.getSapiById(id));
  ipcMain.handle('sapi:create', (_, data) => db.createSapi(data));
  ipcMain.handle('sapi:update', (_, id, data) => db.updateSapi(id, data));
  ipcMain.handle('sapi:delete', (_, id) => db.deleteSapi(id));
  ipcMain.handle('sapi:count', () => db.countSapi());

  // === PERAWATAN ===
  ipcMain.handle('perawatan:getAll', () => db.getAllPerawatan());
  ipcMain.handle('perawatan:bySapi', (_, sapiId) => db.getPerawatanBySapi(sapiId));
  ipcMain.handle('perawatan:create', (_, data) => db.createPerawatan(data));
  ipcMain.handle('perawatan:update', (_, id, data) => db.updatePerawatan(id, data));
  ipcMain.handle('perawatan:delete', (_, id) => db.deletePerawatan(id));

  // === MEDIS ===
  ipcMain.handle('medis:getAll', () => db.getAllMedis());
  ipcMain.handle('medis:bySapi', (_, sapiId) => db.getMedisBySapi(sapiId));
  ipcMain.handle('medis:create', (_, data) => db.createMedis(data));
  ipcMain.handle('medis:update', (_, id, data) => db.updateMedis(id, data));
  ipcMain.handle('medis:delete', (_, id) => db.deleteMedis(id));

  // === PENJUALAN ===
  ipcMain.handle('penjualan:getAll', () => db.getAllPenjualan());
  ipcMain.handle('penjualan:create', (_, data) => db.createPenjualan(data));
  ipcMain.handle('penjualan:update', (_, id, data) => db.updatePenjualan(id, data));
  ipcMain.handle('penjualan:delete', (_, id) => db.deletePenjualan(id));

  // === KEUANGAN / RUGI LABA ===
  ipcMain.handle('keuangan:getRekapitulasi', () => db.getRekapitulasi());
  ipcMain.handle('keuangan:getLaporan', (_, dari, sampai) => db.getLaporan(dari, sampai));
  ipcMain.handle('dashboard:stats', () => db.getDashboardStats());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  db.close();
  app.quit();
});
