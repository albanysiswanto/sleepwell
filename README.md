# Backend API - Panduan Menjalankan di Lokal

Berikut adalah langkah-langkah ringkas dan wajib untuk menjalankan server backend.

## 1. Persiapan Database (Supabase)
1. Buat akun dan buat *project* baru di [supabase.com](https://supabase.com).
2. Di Dashboard Supabase, buka menu **SQL Editor** (ikon `</>`).
3. Buka file **`database/supabase_schema.sql(https://github.com/albanysiswanto/sleepwell/blob/95ef7fdc4e73b3a07e2a00d3c00f4f2b775eb420/backend/database/supabase_schema.sql)`** (file ini berisi rancangan/struktur seluruh tabel yang dibutuhkan oleh aplikasi SleepWell). *Copy* seluruh isinya, *paste* ke SQL Editor Supabase, lalu klik **Run** untuk mengeksekusinya.
4. Untuk mencegah error *Permission Denied*, tambahkan dan jalankan baris ini juga di SQL Editor:
   ```sql
   -- Disable RLS untuk semua tabel SleepWell
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.sleep_logs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.predictions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
   
   -- Grant akses ke service_role
   GRANT ALL ON public.users TO service_role;
   GRANT ALL ON public.sleep_logs TO service_role;
   GRANT ALL ON public.predictions TO service_role;
   GRANT ALL ON public.recommendations TO service_role;
   ```
5. Buka menu ⚙️ **Project Settings** -> **API**.
6. *Copy* **Project URL** dan kunci API yang berlabel **`service_role` `secret`** (kunci panjang yang diawali dengan `eyJ...`).

## 2. Konfigurasi Environment (`.env`)
1. Buka folder `backend` di code editor Anda.
2. Gandakan file `.env.example` dan ubah namanya menjadi `.env`.
3. Buka file `.env` dan isi sesuai panduan berikut:
   ```env
   PORT=5000
   NODE_ENV=development
   # Isi dengan teks acak/password yang panjang dan bebas spasi
   JWT_SECRET=rahasia_aman_12345
   
   # Paste URL Supabase Anda
   SUPABASE_URL=https://<project-id>.supabase.co
   # Paste kunci service_role yang diawali eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG... 
   # FastAPI ML Model
   ML_API_URL=https://albanysiswanto-sleepwell-model-api.hf.space
   ```
   
> **Catatan ML API:** Anda tidak perlu repot-repot menjalankan folder `final-model-api` di komputer lokal Anda. Biarkan URL di atas tetap mengarah ke link HuggingFace (Cloud) tersebut, dan fitur prediksi akan berjalan otomatis. *(Kecuali jika Anda ingin mengedit kode Python-nya, barulah ubah ke `http://127.0.0.1:8000`)*.

## 3. Jalankan Server
Buka terminal, pastikan berada di dalam folder `backend`, lalu jalankan perintah:
```bash
npm install
npm run dev
```
Server backend akan menyala di **http://localhost:5000**.
