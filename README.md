# SleepWell AI - Quick Start

Aplikasi ini berjalan dengan 3 komponen utama. Gunakan **3 terminal terpisah** di dalam folder `SleepWell\sleepwell` dan jalankan secara **berurutan**.

## Persiapan Awal (Wajib)
1. **Konfigurasi Environment Variables**: Lihat panduan di file `.env.example` yang ada di root project. Buat file `.env` di masing-masing folder (`backend` dan `frontend`).
2. **Download Model AI**: Anda perlu mengunduh file model AI untuk menjalankan ML API lokal.
   - Buka link Google Drive berikut: [Download Model AI](https://drive.google.com/drive/folders/1m1ETMAkLkYppTt7-w3VytgYY0kNNOaYn?usp=sharing)
   - Simpan atau letakkan file model yang diunduh ke dalam folder `final-model-api/sleepwell/` (atau direktori model yang semestinya).

## 1. Jalankan ML API (Terminal 1)
```bash
cd final-model-api\sleepwell
.\venv\Scripts\activate
pip install -r requirements.txt   # Opsional jika belum install
python sleepwell_api.py
```
*(Layanan berjalan di port 8000)*

## 2. Jalankan Backend (Terminal 2)
```bash
cd backend
npm install   # Opsional jika belum install
npm run dev
```
*(Layanan berjalan di port 5000)*

## 3. Jalankan Frontend (Terminal 3)
```bash
cd frontend
npm install   # Opsional jika belum install
npm run dev
```
*(Aplikasi web terbuka di http://localhost:5173)*
