# 🐄 Penggemukan Sapi Terpadu

Aplikasi desktop untuk pengelolaan penggemukan sapi terpadu, dibangun dengan **Electron** + **SQLite3**.

## Fitur

- **Dashboard** — Ringkasan statistik: sapi aktif, penjualan, investasi
- **Data Sapi** — CRUD data sapi (tag ID, berat, status, harga beli)
- **Perawatan** — Catatan perawatan per sapi (vaksinasi, vitamin, dll)
- **Supervisi Medis** — Rekaman medis: diagnosa, tindakan, obat, dokter
- **Penjualan** — Pencatatan penjualan dengan perhitungan otomatis
- **Rugi Laba** — Rekapitulasi keuangan lengkap dengan filter tanggal

## Instalasi

```bash
cd I:\projects\appmsapi
npm install
npx electron-rebuild
```

## Menjalankan

```bash
npm start
```

## Stack

- **Frontend:** HTML, CSS, Vanilla JS (tanpa framework)
- **Backend:** Electron (main process)
- **Database:** better-sqlite3 (file-based, otomatis di folder userData)
- **Arsitektur:** contextIsolation + IPC (preload bridge)
