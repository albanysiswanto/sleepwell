# Frontend - Panduan Menjalankan di Lokal

Antarmuka web ini dibangun menggunakan React dan Vite.

## 1. Persyaratan Awal
Pastikan Anda sudah berhasil menyalakan **Backend API** (port 5000) agar fitur *login* dan koneksi *database* bisa berjalan sempurna.

> **💡 Rekomendasi ML API (Sangat Disarankan):**
> Anda **TIDAK PERLU** repot-repot men-*setting* atau menyalakan `final-model-api` secara lokal di komputer Anda. Secara *default*, sistem sudah dikonfigurasi secara otomatis untuk memakai versi *Cloud* yang kami sediakan. Anda cukup menjalankan Frontend dan Backend saja!

> **Catatan Opsional (Hanya jika Anda butuh run ML API di lokal):**
> Jika Anda memang berniat untuk me-*run* model ML secara mandiri secara luring, Anda diwajibkan untuk mengunduh aset model tambahan (seperti model `.pkl` atau `.keras`) melalui tautan Google Drive di bawah ini dan meletakkannya di folder `final-model-api`. *(Tentu saja, jika Anda me-clone repositori ini dan file modelnya sudah terbawa di dalamnya, Anda **tidak perlu** mengunduhnya lagi).*
> [Aset Model ML API - Google Drive](https://drive.google.com/drive/folders/1m1ETMAkLkYppTt7-w3VytgYY0kNNOaYn?usp=sharingmodel)

## 2. Instalasi
Buka terminal baru, arahkan masuk ke folder `frontend`, lalu install semua modul yang dibutuhkan:
```bash
npm install
```

## 3. Jalankan Aplikasi
Jalankan perintah ini untuk menyalakan server UI:
```bash
npm run dev
```
Buka web browser dan akses alamat yang muncul di terminal (biasanya **http://localhost:5173**). Aplikasi siap digunakan!
