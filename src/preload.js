const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // SAPI
  sapi: {
    getAll: () => ipcRenderer.invoke('sapi:getAll'),
    getById: (id) => ipcRenderer.invoke('sapi:getById', id),
    create: (data) => ipcRenderer.invoke('sapi:create', data),
    update: (id, data) => ipcRenderer.invoke('sapi:update', id, data),
    delete: (id) => ipcRenderer.invoke('sapi:delete', id),
    count: () => ipcRenderer.invoke('sapi:count')
  },
  // PERAWATAN
  perawatan: {
    getAll: () => ipcRenderer.invoke('perawatan:getAll'),
    bySapi: (sapiId) => ipcRenderer.invoke('perawatan:bySapi', sapiId),
    create: (data) => ipcRenderer.invoke('perawatan:create', data),
    update: (id, data) => ipcRenderer.invoke('perawatan:update', id, data),
    delete: (id) => ipcRenderer.invoke('perawatan:delete', id)
  },
  // MEDIS
  medis: {
    getAll: () => ipcRenderer.invoke('medis:getAll'),
    bySapi: (sapiId) => ipcRenderer.invoke('medis:bySapi', sapiId),
    create: (data) => ipcRenderer.invoke('medis:create', data),
    update: (id, data) => ipcRenderer.invoke('medis:update', id, data),
    delete: (id) => ipcRenderer.invoke('medis:delete', id)
  },
  // PENJUALAN
  penjualan: {
    getAll: () => ipcRenderer.invoke('penjualan:getAll'),
    create: (data) => ipcRenderer.invoke('penjualan:create', data),
    update: (id, data) => ipcRenderer.invoke('penjualan:update', id, data),
    delete: (id) => ipcRenderer.invoke('penjualan:delete', id)
  },
  // KEUANGAN
  keuangan: {
    getRekapitulasi: () => ipcRenderer.invoke('keuangan:getRekapitulasi'),
    getLaporan: (dari, sampai) => ipcRenderer.invoke('keuangan:getLaporan', dari, sampai)
  },
  // DASHBOARD
  dashboard: {
    stats: () => ipcRenderer.invoke('dashboard:stats')
  }
});
