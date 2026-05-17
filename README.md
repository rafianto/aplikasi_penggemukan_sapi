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

  <img width="1420" height="889" alt="image" src="https://github.com/user-attachments/assets/86ac96da-c9da-45ad-bfe1-4dbbefba7c2e" />

  <img width="1420" height="889" alt="image" src="https://github.com/user-attachments/assets/fdbec38f-7dd1-472f-9ed8-8f983dda5350" />

  <img width="1420" height="889" alt="image" src="https://github.com/user-attachments/assets/29a7435d-0acb-4786-a6fa-855544a1f1b3" />

  <img width="1420" height="889" alt="image" src="https://github.com/user-attachments/assets/3ed82089-c971-405a-a07e-aaa6d1aaa6a6" />




- **Database:** better-sqlite3 (file-based, otomatis di folder userData)
- **Arsitektur:** contextIsolation + IPC (preload bridge)
