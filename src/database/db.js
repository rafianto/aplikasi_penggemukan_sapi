const Database = require('better-sqlite3');
const path2 = require('path');
const { app } = require('electron');

class DB {
  constructor() {
    const dbPath = path2.join(app.getPath('userData'), 'penggemukan_sapi.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  initialize() {
    this.db.exec("CREATE TABLE IF NOT EXISTS sapi (id INTEGER PRIMARY KEY AUTOINCREMENT, tag_id TEXT UNIQUE NOT NULL, nama TEXT NOT NULL, jenis_kelamin TEXT CHECK(jenis_kelamin IN ('Jantan','Betina')) NOT NULL, berat_awal REAL NOT NULL, berat_sekarang REAL NOT NULL, tanggal_masuk TEXT NOT NULL, status TEXT DEFAULT 'Aktif' CHECK(status IN ('Aktif','Terjual','Sakit','Meninggal')), harga_beli REAL NOT NULL, keterangan TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime'))); CREATE TABLE IF NOT EXISTS perawatan (id INTEGER PRIMARY KEY AUTOINCREMENT, sapi_id INTEGER NOT NULL, jenis_perawatan TEXT NOT NULL, tanggal TEXT NOT NULL, keterangan TEXT DEFAULT '', biaya REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now','localtime')), FOREIGN KEY (sapi_id) REFERENCES sapi(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS medis (id INTEGER PRIMARY KEY AUTOINCREMENT, sapi_id INTEGER NOT NULL, dokter TEXT DEFAULT '', diagnosa TEXT NOT NULL, tindakan TEXT DEFAULT '', obat TEXT DEFAULT '', tanggal TEXT NOT NULL, biaya REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now','localtime')), FOREIGN KEY (sapi_id) REFERENCES sapi(id) ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS penjualan (id INTEGER PRIMARY KEY AUTOINCREMENT, sapi_id INTEGER NOT NULL, pembeli TEXT NOT NULL, berat_jual REAL NOT NULL, harga_per_kg REAL NOT NULL, tanggal_jual TEXT NOT NULL, total_harga REAL NOT NULL, keterangan TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime')), FOREIGN KEY (sapi_id) REFERENCES sapi(id)); CREATE TABLE IF NOT EXISTS pengeluaran_lain (id INTEGER PRIMARY KEY AUTOINCREMENT, kategori TEXT NOT NULL, jumlah REAL NOT NULL, tanggal TEXT NOT NULL, keterangan TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime')));");
  }

  getAllSapi() {
    return this.db.prepare("SELECT s.*, (SELECT COALESCE(SUM(p.biaya),0) FROM perawatan p WHERE p.sapi_id = s.id) as total_perawatan, (SELECT COALESCE(SUM(m.biaya),0) FROM medis m WHERE m.sapi_id = s.id) as total_medis FROM sapi s ORDER BY s.tanggal_masuk DESC").all();
  }
  getSapiById(id) { return this.db.prepare('SELECT * FROM sapi WHERE id = ?').get(id); }

  createSapi(data) {
    return this.db.prepare("INSERT INTO sapi (tag_id, nama, jenis_kelamin, berat_awal, berat_sekarang, tanggal_masuk, status, harga_beli, keterangan) VALUES (?,?,?,?,?,?,?,?,?)").run(data.tag_id, data.nama, data.jenis_kelamin, data.berat_awal, data.berat_awal, data.tanggal_masuk, 'Aktif', data.harga_beli, data.keterangan || '').lastInsertRowid;
  }
  updateSapi(id, data) {
    this.db.prepare("UPDATE sapi SET tag_id=?, nama=?, jenis_kelamin=?, berat_awal=?, berat_sekarang=?, tanggal_masuk=?, status=?, harga_beli=?, keterangan=? WHERE id=?").run(data.tag_id, data.nama, data.jenis_kelamin, data.berat_awal, data.berat_sekarang, data.tanggal_masuk, data.status, data.harga_beli, data.keterangan || '', id);
    return true;
  }
  deleteSapi(id) {
    this.db.prepare('DELETE FROM perawatan WHERE sapi_id = ?').run(id);
    this.db.prepare('DELETE FROM medis WHERE sapi_id = ?').run(id);
    this.db.prepare('DELETE FROM sapi WHERE id = ?').run(id);
    return true;
  }
  countSapi() {
    return { aktif: this.db.prepare("SELECT COUNT(*) as c FROM sapi WHERE status='Aktif'").get().c, terjual: this.db.prepare("SELECT COUNT(*) as c FROM sapi WHERE status='Terjual'").get().c };
  }

  getAllPerawatan() {
    return this.db.prepare("SELECT p.*, s.tag_id, s.nama as nama_sapi FROM perawatan p JOIN sapi s ON p.sapi_id = s.id ORDER BY p.tanggal DESC").all();
  }
  getPerawatanBySapi(sapiId) { return this.db.prepare('SELECT * FROM perawatan WHERE sapi_id = ? ORDER BY tanggal DESC').all(sapiId); }
  createPerawatan(data) {
    return this.db.prepare("INSERT INTO perawatan (sapi_id, jenis_perawatan, tanggal, keterangan, biaya) VALUES (?,?,?,?,?)").run(data.sapi_id, data.jenis_perawatan, data.tanggal, data.keterangan || '', data.biaya || 0).lastInsertRowid;
  }
  updatePerawatan(id, data) {
    this.db.prepare("UPDATE perawatan SET sapi_id=?, jenis_perawatan=?, tanggal=?, keterangan=?, biaya=? WHERE id=?").run(data.sapi_id, data.jenis_perawatan, data.tanggal, data.keterangan || '', data.biaya || 0, id);
    return true;
  }
  deletePerawatan(id) { this.db.prepare('DELETE FROM perawatan WHERE id = ?').run(id); return true; }

  getAllMedis() {
    return this.db.prepare("SELECT m.*, s.tag_id, s.nama as nama_sapi FROM medis m JOIN sapi s ON m.sapi_id = s.id ORDER BY m.tanggal DESC").all();
  }
  getMedisBySapi(sapiId) { return this.db.prepare('SELECT * FROM medis WHERE sapi_id = ? ORDER BY tanggal DESC').all(sapiId); }
  createMedis(data) {
    return this.db.prepare("INSERT INTO medis (sapi_id, dokter, diagnosa, tindakan, obat, tanggal, biaya) VALUES (?,?,?,?,?,?,?)").run(data.sapi_id, data.dokter || '', data.diagnosa, data.tindakan || '', data.obat || '', data.tanggal, data.biaya || 0).lastInsertRowid;
  }
  updateMedis(id, data) {
    this.db.prepare("UPDATE medis SET sapi_id=?, dokter=?, diagnosa=?, tindakan=?, obat=?, tanggal=?, biaya=? WHERE id=?").run(data.sapi_id, data.dokter || '', data.diagnosa, data.tindakan || '', data.obat || '', data.tanggal, data.biaya || 0, id);
    return true;
  }
  deleteMedis(id) { this.db.prepare('DELETE FROM medis WHERE id = ?').run(id); return true; }

  getAllPenjualan() {
    return this.db.prepare("SELECT p.*, s.tag_id, s.nama as nama_sapi, s.harga_beli FROM penjualan p JOIN sapi s ON p.sapi_id = s.id ORDER BY p.tanggal_jual DESC").all();
  }
  createPenjualan(data) {
    const fn = this.db.transaction(() => {
      const r = this.db.prepare("INSERT INTO penjualan (sapi_id, pembeli, berat_jual, harga_per_kg, tanggal_jual, total_harga, keterangan) VALUES (?,?,?,?,?,?,?)").run(data.sapi_id, data.pembeli, data.berat_jual, data.harga_per_kg, data.tanggal_jual, data.total_harga, data.keterangan || '');
      this.db.prepare("UPDATE sapi SET status='Terjual' WHERE id=?").run(data.sapi_id);
      return r.lastInsertRowid;
    });
    return fn();
  }
  updatePenjualan(id, data) {
    this.db.prepare("UPDATE penjualan SET sapi_id=?, pembeli=?, berat_jual=?, harga_per_kg=?, tanggal_jual=?, total_harga=?, keterangan=? WHERE id=?").run(data.sapi_id, data.pembeli, data.berat_jual, data.harga_per_kg, data.tanggal_jual, data.total_harga, data.keterangan || '', id);
    return true;
  }
  deletePenjualan(id) {
    const row = this.db.prepare('SELECT sapi_id FROM penjualan WHERE id = ?').get(id);
    if (row) this.db.prepare("UPDATE sapi SET status='Aktif' WHERE id=? AND status='Terjual'").run(row.sapi_id);
    this.db.prepare('DELETE FROM penjualan WHERE id = ?').run(id);
    return true;
  }

  getRekapitulasi() {
    const tp = this.db.prepare('SELECT COALESCE(SUM(harga_beli),0) as t FROM sapi').get().t;
    const tr = this.db.prepare('SELECT COALESCE(SUM(biaya),0) as t FROM perawatan').get().t;
    const tm = this.db.prepare('SELECT COALESCE(SUM(biaya),0) as t FROM medis').get().t;
    const tl = this.db.prepare('SELECT COALESCE(SUM(jumlah),0) as t FROM pengeluaran_lain').get().t;
    const tj = this.db.prepare('SELECT COALESCE(SUM(total_harga),0) as t FROM penjualan').get().t;
    const tot = tp + tr + tm + tl;
    return { pemasukan: { penjualan: tj, total: tj }, pengeluaran: { pembelian: tp, perawatan: tr, medis: tm, lainnya: tl, total: tot }, labaRugi: tj - tot };
  }
  getLaporan(dari, sampai) {
    return {
      penjualan: this.db.prepare("SELECT p.*, s.tag_id, s.nama as nama_sapi, s.harga_beli, (p.total_harga - s.harga_beli) as laba_per_ekor FROM penjualan p JOIN sapi s ON p.sapi_id = s.id WHERE p.tanggal_jual BETWEEN ? AND ? ORDER BY p.tanggal_jual DESC").all(dari, sampai),
      perawatan: this.db.prepare("SELECT p.*, s.tag_id, s.nama as nama_sapi FROM perawatan p JOIN sapi s ON p.sapi_id = s.id WHERE p.tanggal BETWEEN ? AND ? ORDER BY p.tanggal DESC").all(dari, sampai),
      medis: this.db.prepare("SELECT m.*, s.tag_id, s.nama as nama_sapi FROM medis m JOIN sapi s ON m.sapi_id = s.id WHERE m.tanggal BETWEEN ? AND ? ORDER BY m.tanggal DESC").all(dari, sampai)
    };
  }

  getDashboardStats() {
    const sapiAktif = this.db.prepare("SELECT COUNT(*) as c FROM sapi WHERE status='Aktif'").get().c;
    const sapiTerjual = this.db.prepare("SELECT COUNT(*) as c FROM sapi WHERE status='Terjual'").get().c;
    const sapiSakit = this.db.prepare("SELECT COUNT(*) as c FROM sapi WHERE status='Sakit'").get().c;
    const totalSapi = this.db.prepare('SELECT COUNT(*) as c FROM sapi').get().c;
    const totalInvestasi = this.db.prepare("SELECT COALESCE(SUM(harga_beli),0) as t FROM sapi WHERE status IN ('Aktif','Sakit')").get().t;
    const totalPenjualan = this.db.prepare('SELECT COALESCE(SUM(total_harga),0) as t FROM penjualan').get().t;
    const totalBiaya = this.db.prepare("SELECT COALESCE((SELECT SUM(biaya) FROM perawatan),0) + COALESCE((SELECT SUM(biaya) FROM medis),0) as t").get().t;
    const sapiTerbaru = this.db.prepare('SELECT * FROM sapi ORDER BY created_at DESC LIMIT 5').all();
    const penjualanTerbaru = this.db.prepare("SELECT p.*, s.nama as nama_sapi FROM penjualan p JOIN sapi s ON p.sapi_id = s.id ORDER BY p.created_at DESC LIMIT 5").all();
    return { sapiAktif, sapiTerjual, sapiSakit, totalSapi, totalInvestasi, totalPenjualan, totalBiaya, sapiTerbaru, penjualanTerbaru };
  }

  close() { this.db.close(); }
}
module.exports = DB;
