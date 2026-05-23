# SleepWell AI - Quick Start

Aplikasi ini berjalan dengan 3 komponen utama. Gunakan **3 terminal terpisah** di dalam folder `SleepWell\sleepwell` dan jalankan secara **berurutan**.

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
