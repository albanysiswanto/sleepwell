# Dashboard Analisis Aktivitas Fisik dan Pola Tidur

Visualisasi interaktif untuk mengeksplorasi hubungan antara aktivitas fisik, tingkat stres, kategori BMI, durasi tidur, kualitas tidur, dan gangguan tidur. Data yang digunakan berasal dari pengukuran pengguna pada periode April 2016.

## Fitur Utama

- Visualisasi hubungan aktivitas fisik dengan durasi dan kualitas tidur
- Analisis korelasi antara tingkat stres dan pola tidur
- Segmentasi berdasarkan kategori BMI
- Filter interaktif untuk rentang tanggal, intensitas aktivitas, dan kualitas tidur
- Ringkasan statistik dan insight yang mudah dipahami

## Persyaratan

- Python 3.9 atau lebih baru
- Disarankan menggunakan lingkungan terisolasi (Conda/venv)
- Dependensi tercantum di `requirements.txt`

## Instalasi (Conda)

```bash
conda create --name sleep-dashboard python=3.9 -y
conda activate sleep-dashboard
pip install -r requirements.txt
```

Jika tidak menggunakan Conda, buat virtualenv dan instal dependensi:

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Menjalankan Dashboard

```bash
streamlit run dashboard-capstone-project.py
```

Halaman akan terbuka otomatis di browser pada `http://localhost:8501` atau alamat yang ditampilkan di terminal.

## Dataset

Proyek ini menggunakan beberapa sumber data Fitabase dan dataset kesehatan tidur:

- Fitabase Data 3.12.16-4.11.16
- Fitabase Data 4.12.16-5.12.16
- Sleep_health_and_lifestyle_dataset.csv

Catatan: Karena ukuran file mentah relatif besar, dataset sumber tidak disertakan langsung di repositori. Anda bisa mengunduh data mentah dari Google Drive proyek (akses sesuai kebijakan privasi) dan tempatkan file di folder `data/` sebelum menjalankan aplikasi.

Google Drive: https://drive.google.com/drive/folders/13R3Ih25d4v0kRuajC71Qe-AcyqayYA2g?usp=sharing
