**Dokumen Project Plan**  
**Coding Camp 2026 powered by DBS Foundation**

**ID Tim Capstone Project	:** CC26-PSU283

**Tema Capstone		:** Healthy Lives & Well-being

**Nama/Judul Proyek	:** SleepWell AI: Analisis Kualitas Tidur untuk Peningkatan Produktivitas dan Well-being

**List Anggota		:** 

1. CFCC206D6Y0844 \- Ridho Ahmad Irawan \- Full-Stack Web Developer \- \[**Aktif\]**  
2. CFCC367D6Y1960 \- Naufal Kalam Marudi \- Full-Stack Web Developer \- \[**Aktif\]**  
3. CDCC206D6X1673 \- Seni Yanti \- Data Science \- \[**Aktif\]**  
4. CDCC326D6X2670 \- Nurul Amanda \- Data Science \- \[**Aktif\]**  
5. CACC005D6Y2555 \- Naufal Ghifari Hidayat \- AI Engineer \- \[**Aktif\]**  
6. CACC005D6Y2074 \- Albany Siswanto \- AI Engineer \- **\[Aktif\]**  
     
1. **Ringkasan Eksekutif**

Kualitas tidur yang buruk merupakan masalah kesehatan yang sering diabaikan, padahal memiliki dampak signifikan terhadap produktivitas, kesehatan mental, dan kesejahteraan jangka panjang. Banyak individu mengalami gangguan tidur seperti insomnia, *sleep apnea* ringan, atau pola tidur tidak teratur tanpa menyadari kondisi tersebut hingga muncul dampak yang lebih serius.

**Pernyataan Masalah (Problem Statement):**

	Belum tersedia solusi yang mudah diakses, terjangkau, dan cukup personal untuk membantu masyarakat memantau serta menganalisis kualitas tidur secara berbasis data. Sebagian besar aplikasi hanya berfungsi sebagai pencatat, sementara perangkat *wearable* relatif mahal dan belum inklusif bagi semua kalangan.

**Pernyataan Penelitian (Research Questions):**

1. Bagaimana membangun model *machine learning* yang mampu menganalisis data tidur harian untuk mendeteksi pola gangguan tidur dan memprediksi tingkat kebugaran/produktivitas hari berikutnya?  
2. Bagaimana merancang sistem *input* parameter tidur yang mudah digunakan serta *dashboard* visualisasi interaktif yang mudah dipahami oleh pengguna awam?  
3. Bagaimana memastikan rekomendasi yang dihasilkan sistem bersifat personal, dapat ditindaklanjuti (*actionable*), dan mendorong perubahan perilaku tidur yang positif?

**Latar Belakang & Alasan Memilih Proyek:**

	*SleepWell AI* dikembangkan sebagai solusi berbasis data yang berfokus pada deteksi dini dan pencegahan masalah tidur, bukan sekadar alat pencatat. Sistem ini memanfaatkan data historis dari dataset publik (*Kaggle*) untuk melatih model *machine learning*, serta menerima input harian pengguna seperti durasi tidur, kualitas tidur, tingkat stres, dan aktivitas. Data tersebut kemudian dianalisis untuk menghasilkan prediksi kondisi esok hari dan rekomendasi perbaikan yang personal. Dengan pendekatan ini, pengguna dapat memahami pola tidur mereka lebih awal dan mengambil tindakan preventif sebelum berdampak lebih serius. Proyek ini dipilih karena relevan dengan tema *Healthy Lives & Well-being* serta memiliki potensi implementasi nyata dalam meningkatkan kualitas hidup masyarakat secara luas.

**B. Cakupan Proyek dan Hasil Kerja**

Berikut adalah garis besar batasan proyek dan bagaimana tim akan memecahkan masalah serta cakupan tanggung jawab setiap individu dalam tim.

| Nama Proyek | SleepWell AI: Analisis Kualitas Tidur untuk Peningkatan Produktivitas dan Well-being |
| :---- | :---- |
| **Tema** | Healthy Lives & Well-being |
| **Estimasi Waktu** | 5 Minggu (±35 Hari) |
| **Tim Data Science** | (Seni Yanti), (Nurul Amanda) \- EDA, data wrangling, feature engineering, visualisasi |
| **Tim AI Engineer** | (Naufal Ghifari Hidayat), (Albany Siswanto) \- pembangunan, pelatihan, dan evaluasi model prediksi |
| **Tim Full-Stack Web Developer** | (Ridho Ahmad Irawan), (Naufal Kalam Marudi) \- backend API, dashboard frontend, deployment |
| **Target Mingguan** | Weekly review setiap hari Minggu pukul 19.00 WIB via Zoom/Discord Daily stand-up pukul 20.00 WIB via Discord/WhatsApp |

**Batasan Proyek:**

* Analisis dalam proyek ini menggunakan kombinasi dataset publik dari *Kaggle*, yaitu *Sleep Health and Lifestyle Dataset* (cross-sectional) dan dataset aktivitas harian dari perangkat *wearable* (Fitbit) yang bersifat *time series*. Dataset *cross-sectional* ditransformasikan menjadi *time series* melalui proses *synthetic data generation* dengan tetap mempertahankan distribusi aslinya.  
* Sebagian variabel dalam dataset, seperti tingkat stres, kualitas tidur, dan kondisi fisik, bersifat *self-reported* sehingga memiliki potensi bias subjektivitas. Data Fitbit yang digunakan juga merupakan data historis, bukan data *real-time* dari pengguna sistem.  
* Model ML memprediksi fitness score dan wellbeing index (bukan diagnosis medis). Sistem rekomendasi menggunakan pendekatan hybrid: output model ML \+ rule-based.  
* Proyek dikembangkan dalam bentuk aplikasi berbasis web menggunakan *framework* seperti React dan Express/Node.js, serta tidak mencakup pengembangan aplikasi mobile (Android/iOS).  
* Dataset yang digunakan merupakan hasil penggabungan dan transformasi dari beberapa sumber data, termasuk proses generasi data sintetis, sehingga tidak sepenuhnya merepresentasikan data longitudinal nyata, melainkan simulasi berbasis distribusi dan pola dari dataset asli.  
* Dataset bersumber dari data publik (Kaggle) dan bukan merupakan data rekam medis resmi, sehingga hasil analisis dan model yang dihasilkan memiliki keterbatasan dalam representasi kondisi kesehatan individu secara klinis.

**Tujuan Proyek:**

* Melakukan EDA mendalam pada dataset pola tidur untuk mengidentifikasi faktor yang paling berpengaruh terhadap kualitas tidur dan produktivitas.  
* Membangun model prediksi berbasis machine learning (Random Forest, XGBoost) yang memprediksi fitness score dan wellbeing index pengguna esok hari.  
* Mengembangkan sistem rekomendasi personalisasi yang memberikan saran perbaikan tidur berdasarkan pola data pengguna.  
* Membangun RESTful API backend (Express & Node.js) dan mengintegrasikan model ML dengan antarmuka frontend.  
* Merancang dashboard yang interaktif, menampilkan grafik tren tidur yang mudah dipahami pengguna awam.  
* Menyelesaikan seluruh tahapan proyek sesuai jadwal dengan dokumentasi yang rapi.

**Hasil Kerja (Deliverables) per Fase:**

| Fase | Data Science | AI Engineer | Full-Stack Web Developer |
| :---: | ----- | ----- | ----- |
| **Fase 1 (Minggu 1\)** | Pengumpulan dataset, data cleaning & preprocessing, EDA awal | **\-** | Desain wireframe & UI/UX (Figma), setup proyek & repository GitHub |
| **Fase 2 (Minggu 2\)** | EDA lanjutan, visualisasi data, feature engineering (fitness\_score, wellbeing\_index) | Riset algoritma, persiapan data modeling, baseline model | Membangun backend API (FastAPI/Flask), setup database & endpoint awal |
| **Fase 3 (Minggu 3\)** | Dokumentasi EDA & Data Dictionary | Training model RF & XGBoost, evaluasi (MAE, MSE, R²), hyperparameter tuning, export .pkl | Membangun dashboard, integrasi form input tidur |
| **Fase 4 (Minggu 4\)** | Validasi insight & rekomendasi final | Sistem rekomendasi personalisasi, integrasi model ke backend API | Integrasi API dengan dashboard, user testing & bug fixing, deployment |
| **Fase 5 (Minggu 5\)** | Laporan teknis komprehensif & dokumentasi akhir | Finalisasi model, dokumentasi teknis ML | Final review, video presentasi, submit project |

**C. Jadwal  Pengerjaan**

Berikut adalah jadwal pengerjaan proyek SleepWell AI dalam 5 minggu, mencakup Gantt Chart overview dan rincian jadwal harian. Jadwal ini telah disepakati oleh seluruh anggota tim.

| Aktivitas / PIC | M1 | M2 | M3 | M4 | M5 | PIC |
| ----- | :---: | :---: | :---: | :---: | :---: | :---: |
| Pengumpulan dataset (Kaggle/survei) | **✓** |  |  |  |  | **DS1** |
| Data cleaning & preprocessing | **✓** |  |  |  |  | **DS1** |
| EDA & Visualisasi Data |  | **✓** |  |  |  | **DS1, DS2** |
| Feature Engineering |  | **✓** |  |  |  | **DS1, DS2** |
| Modeling (Random Forest, XGBoost) |  |  | **✓** |  |  | **AI1** |
| Evaluasi model & hyperparameter tuning |  |  | **✓** |  |  | **AI2** |
| Export model & sistem rekomendasi |  |  | **✓** |  |  | **AI1, AI2** |
| Backend API (Express & Node.js) |  | **✓** |  |  |  | **FSW1** |
| Dashboard (Frontend) |  |  | **✓** |  |  | **FSW2** |
| Integrasi API \+ dashboard \+ testing |  |  |  | **✓** |  | **FSW1, FSW2** |
| Deployment (frontend & backend) |  |  |  | **✓** |  | **ALL** |
| Final report & dokumentasi |  |  |  |  | **✓** | **ALL** |
| Video presentasi & submit |  |  |  |  | **✓** | **ALL** |

**Jadwal Harian per Minggu:**

*Minggu 1* (*Data Collection & Preprocessing*)

| Hari | Aktivitas | PIC |
| :---: | ----- | :---: |
| Senin | Identifikasi & download dataset dari Kaggle/survei | DS1 |
| Selasa | Validasi kelengkapan & kualitas data | DS1 |
| Rabu | Handling missing values & outliers | DS1 |
| Kamis | Standardisasi format data & labeling \+ setup GitHub proyek | DS1, FSW1 |
| Jum’at | Review hasil cleaning oleh tim \+ desain wireframe awal (Figma) | ALL |
| Sabtu | Dokumentasi proses cleaning \+ desain UI/UX lanjutan | DS1, FSW1 |
| Minggu | Weekly review & planning minggu depan | ALL |

*Minggu 2 EDA, Visualisasi & Backend Setup*

| Hari | Aktivitas | PIC |
| :---: | ----- | :---: |
| Senin | Analisis statistik deskriptif & distribusi data tidur | DS2 |
| Selasa | Membuat visualisasi pola tidur, korelasi & heatmap | DS2 |
| Rabu | Analisis korelasi & identifikasi fitur penting | DS2 |
| Kamis | Feature engineering (fitness\_score, wellbeing\_index) \+ setup FastAPI | DS1, FSW1 |
| Jumat | Review insight EDA \+ testing endpoint API awal | ALL |
| Sabtu | Dokumentasi EDA \+ pengembangan backend lanjutan | DS2, FSW1 |
| Minggu | Weekly review & planning minggu depan | ALL |

*Minggu 3 Modeling & Dashboard Development*

| Hari | Aktivitas | PIC |
| :---: | ----- | :---: |
| Senin | Split data (train-test) & baseline model | AI1 |
| Selasa | Training model Random Forest | AI1 |
| Rabu | Training model XGBoost & komparasi performa | AI1 |
| Kamis | Evaluasi model (MAE, MSE, R²) \+ Membangun dashboard Streamlit | AI2, FSW2 |
| Jumat | Hyperparameter tuning \+ integrasi form input tidur ke dashboard | AI2, FSW2 |
| Sabtu | Export model terbaik ke .pkl \+ testing dashboard | AI1, AI2 |
| Minggu | Weekly review & planning minggu depan | ALL |

*Minggu 4 Integrasi, Testing & Deployment*

| Hari | Aktivitas | PIC |
| :---: | ----- | :---: |
| Senin | Membangun sistem rekomendasi personalisasi (rule-based \+ ML) | AI1, AI2 |
| Selasa | Integrasi model ML ke backend API | FSW1, AI1 |
| Rabu | Testing endpoint API secara menyeluruh (Postman) | FSW1 |
| Kamis | Integrasi API dengan dashboard Streamlit | FSW1, FSW2 |
| Jumat | User testing & bug fixing menyeluruh | ALL |
| Sabtu | Deployment frontend (Streamlit Cloud) & backend (GCP/Railway) | FSW1, FSW2 |
| Minggu | Weekly review & planning minggu depan | ALL |

*Minggu 5 Finalisasi & Presentasi*

| Hari | Aktivitas | PIC |
| :---: | ----- | :---: |
| Senin | Penyusunan final report & dokumentasi teknis | ALL |
| Selasa | Review & revisi final report | ALL |
| Rabu | Pembuatan slide presentasi proyek | ALL |
| Kamis | Rekaman video presentasi & demo aplikasi | ALL |
| Jumat | Editing video & final review keseluruhan | FSW2 |
| Sabtu | Final check semua deliverables & upload ke repository | ALL |
| Minggu | Submit project | ALL |

**Rutinitas Tim:**

| Kegiatan | Waktu | Platform | PIC |
| :---: | ----- | ----- | :---: |
| Daily stand-up | 20.00 WIB (setiap hari) | Discord / WhatsApp | Semua |
| Progress report | Senin & Kamis (20.00 WIB) | Google Docs | Koordinator |
| Review mingguan | Minggu (19.00 WIB) | Zoom / Discord | Semua |
| Backup kode | Setiap selesai tugas | GitHub | Masing-masing |

**D. Uraian Rencana Penugasan/*Job Desk* Setiap Learning Path**  
Berikut adalah rencana penugasan yang diberikan pada masing-masing learning path anggota tim SleepWell AI:

| Data Science | Machine Learning / AI | Full-Stack Web |
| ----- | ----- | ----- |
| Pengumpulan & eksplorasi dataset (Kaggle/survei) Data cleaning & preprocessing (missing values, outliers, standardisasi) Exploratory Data Analysis (EDA) mendalam Visualisasi data & insight awal (distribusi, heatmap, korelasi) Feature engineering: pembuatan fitness\_score & wellbeing\_index Pembuatan Data Dictionary Menyiapkan data yang sudah bersih untuk proses modeling Laporan teknis komprehensif dari Problem Discovery hingga hasil akhir | Membangun model ML menggunakan TensorFlow/Keras (Random Forest, XGBoost) Implementasi Custom Layer, Custom Loss Function, atau Custom Callback Evaluation model (MAE, MSE, R²) & hyperparameter tuning Export model terbaik ke format .pkl / SavedModel Membangun sistem rekomendasi personalisasi (rule-based \+ ML) Integrasi model ML ke backend API Membuat kode inference untuk input parameter tidur baru Model deployment & dokumentasi teknis ML | Membangun RESTful API backend (FastAPI/Flask) Menerima & memproses input gambar/parameter tidur dari frontend Testing endpoint API dengan Postman Membangun dashboard Streamlit (frontend) yang interaktif Form input parameter tidur yang mudah digunakan pengguna Integrasi API dengan dashboard Streamlit User testing & bug fixing menyeluruh Deployment frontend (Streamlit Cloud) & backend (GCP/Railway) |

**E. Sumber Daya Proyek**  
Berikut adalah sumber daya yang diperlukan dalam pengerjaan proyek SleepWell AI, mencakup bahasa pemrograman, framework, tools, API, cloud backend, dan dataset:

| Tools / Sumber Daya | Fungsi | Pengguna |
| :---: | ----- | :---: |
| Python 3.10+ | Bahasa pemrograman utama untuk seluruh proses data, dan pembuatan model Machine Learning | DS, AI |
| Google Colab | IDE cloud berbasis GPU untuk pengembangan & pelatihan model ML tanpa setup lokal yang rumit | DS, AI |
| Pandas & NumPy | Manipulasi data, komputasi numerik, dan analisis data tabular | DS1, DS2 |
| Matplotlib & Seaborn | Visualisasi data selama EDA: distribusi, heatmap, correlation plot, confusion matrix | DS2 |
| Scikit-learn | Utilitas ML: label encoding, train-test split, evaluasi performa (MAE, MSE, R²), scaling fitur | AI1, AI2 |
| TensorFlow & Keras | Framework utama untuk membangun, melatih, dan menyimpan model ML dengan dukungan Custom Layer/Loss/Callback | AI1, AI2 |
| XGBoost / Random Forest | Algoritma model prediksi utama untuk fitness score dan wellbeing index pengguna | AI1 |
| Express & Node.Js | [Node.js](http://Node.js) adalah runtime JavaScript Server-Side, Express framework web cepat & API. Keduanya digunakan untuk membangun backend, routing, dan middleware secara efisien | FSW1 |
| React & Tailwind CSS | React membangun komponen UI interaktif & dinamis, sedangkan Tailwind CSS mempercepat styling responsif tanpa CSS custom. Keduanya mempermudah pembuatan dashboard modern, modular dan cepat | FSW2 |
| Postman | Pengujian endpoint REST API secara manual selama pengembangan dan integrasi frontend-backend | FSW1, FSW2 |
| Google Cloud Platform / Railway | Platform cloud untuk hosting backend API dan deployment model ML | FSW1 |
| Figma | Desain wireframe, UI/UX, dan prototype interaktif sebelum implementasi ke kode nyata | FSW1, FSW2 |
| Git & GitHub | Version control dan kolaborasi kode antar anggota tim secara sinkron | Semua |
| Google Calendar | Pengingat deadline dan jadwal meeting tim | Semua |
| Freedcamp / GitHub Projects | Tracking progress tugas dan manajemen issue proyek | Semua |
| Discord / WhatsApp | Komunikasi harian dan koordinasi tim secara real-time | Semua |
| Sleep Health & Lifestyle serta FitBit Fitness Tracker Data Dataset (Kaggle) | Sumber informasi karakteristik kesehatan dan kualitas tidur, serta dataset Fitbit sebagai referensi pola aktivitas harian berbasis time series untuk mendukung analisis temporal. | DS, AI |
| Visual Studio Code | Editor kode sumber untuk penulisan, pengelolaan, dan debugging kode backend maupun frontend | FSW1, FSW2 |

**F. Rencana Manajemen Resiko dan Isu**  
Berikut adalah hasil identifikasi terhadap faktor-faktor yang berpotensi menjadi penyebab proyek gagal atau tertunda, beserta strategi mitigasinya:

| No | Potensi Risiko | Dampak | Probabilitas | Strategi Mitigasi |
| :---: | ----- | :---: | :---: | ----- |
| 1 | Dataset tidak representatif atau tidak seimbang | **Tinggi** | Sedang | Lakukan eksplorasi & validasi data secara menyeluruh. Terapkan teknik augmentasi data dan cross-validation selama training. Tambahkan data survei mandiri jika diperlukan. |
| 2 | Performa model kurang memadai (akurasi rendah) | **Tinggi** | Sedang | Coba multiple algoritma (RF, XGBoost, LightGBM), lakukan hyperparameter tuning intensif, dan pertimbangkan ensemble method untuk meningkatkan akurasi. |
| 3 | Integrasi API frontend-backend bermasalah (CORS, timeout, format data) | Sedang | **Tinggi** | Terapkan validasi input, retry logic, dan error handling yang baik pada frontend maupun backend. Konfigurasikan middleware CORS dan lakukan testing Postman secara berkala. |
| 4 | Keterbatasan resource komputasi (Google Colab timeout/disconnect) | Sedang | **Tinggi** | Gunakan Google Colab Pro. Simpan checkpoint model secara berkala ke Google Drive. Gunakan arsitektur model yang ringan bila diperlukan. |
| 5 | Keterlambatan progres akibat anggota tim tidak aktif | **Tinggi** | Sedang | Bagi tugas secara modular dan terperinci. Lakukan daily stand-up untuk monitoring. Anggota aktif saling membantu jika ada yang tertinggal. Dokumentasikan seluruh progres di GitHub. |
| 6 | Masalah deployment (error saat hosting di cloud) | Sedang | Sedang | Siapkan environment yang konsisten (requirements.txt/Docker). Lakukan testing deployment lebih awal di minggu 4, bukan hanya di akhir proyek. |
| 7 | Keterbatasan waktu & scope creep (fitur terus bertambah) | Sedang | **Tinggi** | Tetapkan milestones mingguan yang jelas. Pisahkan fitur wajib (must-have) dari fitur opsional (nice-to-have). Prioritaskan deliverables inti terlebih dahulu sebelum fitur tambahan. |

Tim *SleepWell AI* berkomitmen untuk menyelesaikan seluruh deliverables sesuai jadwal yang telah ditetapkan, dengan mengedepankan kualitas kerja, kolaborasi yang solid, dan dokumentasi yang rapi. Proyek ini merupakan wujud nyata kontribusi tim dalam tema *Healthy Lives & Well-being* membangun solusi teknologi yang empatik, bertanggung jawab, dan berorientasi pada pencegahan demi meningkatkan kualitas hidup masyarakat.