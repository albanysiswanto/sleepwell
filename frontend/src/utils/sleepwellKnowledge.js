/**
 * SleepWell AI — Local Knowledge Base & Keyword-Aware Chatbot Engine
 * 
 * Menyediakan jawaban cerdas berbasis kata kunci untuk pertanyaan seputar
 * domain SleepWell AI tanpa perlu memanggil API eksternal.
 * Dibangun dari dokumentasi model ML di final-model-api.
 */

// ══════════════════════════════════════════════════════════════
// 1. KNOWLEDGE BASE — Domain pengetahuan SleepWell
// ══════════════════════════════════════════════════════════════

const KNOWLEDGE_BASE = [
  // ── Fitness Score ──
  {
    keywords: ['fitness score', 'fitness_score', 'skor fitness', 'skor kebugaran', 'nilai fitness', 'fitness itu apa', 'apa itu fitness'],
    title: 'Fitness Score',
    answer: `**Fitness Score** adalah skor prediksi tingkat kebugaran fisik Anda untuk **hari esok** (skala 0–100).

🔬 **Bagaimana dihitung?**
Skor ini diprediksi oleh model Machine Learning berdasarkan data tidur & aktivitas hari ini, termasuk: durasi tidur, kualitas tidur, jumlah langkah, aktivitas intens, dan level stres.

📊 **Interpretasi Skor:**
• **65–100** 🟢 Baik — kebugaran fisik diprediksi optimal
• **45–64** 🟡 Sedang — ada ruang perbaikan
• **0–44** 🔴 Perlu Perhatian — kurangi stres & prioritaskan istirahat

⚠️ **Catatan Penting:**
Fitness score lebih sulit diprediksi karena dipengaruhi faktor eksternal (jadwal kerja, cuaca, motivasi) yang tidak tercakup di dataset tidur. Model memiliki MAE ~9 poin (error ~9%).`
  },

  // ── Wellbeing Index ──
  {
    keywords: ['wellbeing', 'well being', 'well-being', 'kesejahteraan', 'skor wellbeing', 'wellbeing index', 'indeks wellbeing', 'apa itu wellbeing'],
    title: 'Wellbeing Index',
    answer: `**Wellbeing Index** adalah skor prediksi tingkat kesejahteraan mental & fisik Anda untuk **hari esok** (skala 0–100).

🔬 **Bagaimana dihitung?**
Skor ini memiliki hubungan kausal langsung dengan kualitas tidur Anda. Model ML menganalisis durasi tidur, efisiensi tidur, kualitas tidur, dan level stres untuk memprediksi nilai ini.

📊 **Interpretasi Skor:**
• **65–100** 🟢 Baik — kesejahteraan diprediksi optimal
• **45–64** 🟡 Sedang — perlu perbaikan pola tidur
• **0–44** 🔴 Rendah — segera perbaiki kualitas tidur

✅ **Akurasi Sangat Tinggi:**
Model memiliki R² = 0.9445 (akurasi 94.45%) dan MAE hanya ~1.8 poin. Artinya, prediksi wellbeing sangat reliabel karena kualitas tidur memang berpengaruh langsung terhadap kesejahteraan.`
  },

  // ── Model ML ──
  {
    keywords: ['model ml', 'machine learning', 'model ai', 'random forest', 'xgboost', 'tensorflow', 'deep learning', 'model apa', 'algoritma', 'cara kerja model', 'bagaimana model'],
    title: 'Model Machine Learning SleepWell',
    answer: `SleepWell AI menggunakan **3 model Machine Learning** yang berbeda:

🌲 **1. Random Forest (RF)**
Model ensemble yang menggabungkan banyak decision tree. Cepat, stabil, dan cocok untuk data tabular.

⚡ **2. XGBoost (XGB)**
Gradient boosting dengan performa tinggi. Dioptimasi untuk kecepatan dan akurasi prediksi.

🧠 **3. TensorFlow Deep Learning (TF)**
Neural network dengan **Attention Layer** kustom yang memberi bobot perhatian pada fitur paling penting. Arsitektur:
\`Input → AttentionLayer → Dense(32) → BatchNorm → Dropout → Dense(16) → BatchNorm → Dropout → Dense(2, sigmoid)\`

📊 **Perbandingan Performa:**
| Model | Wellbeing MAE | Wellbeing R² |
|-------|-------------|------------|
| Random Forest | 1.92 | 0.9441 |
| XGBoost | 1.88 | 0.9438 |
| TensorFlow DL | 1.95 | 0.9427 |

Ketiga model memiliki performa yang sangat baik untuk prediksi wellbeing (~94% akurasi).`
  },

  // ── Attention Layer ──
  {
    keywords: ['attention layer', 'attention', 'custom layer', 'lapisan attention'],
    title: 'Attention Layer (Custom)',
    answer: `**AttentionLayer** adalah komponen kustom pada model Deep Learning SleepWell.

🎯 **Fungsi:**
Memberi *bobot perhatian* pada fitur-fitur input yang paling relevan. Misalnya, jika kualitas tidur memiliki pengaruh besar terhadap wellbeing, attention layer akan otomatis memberi bobot lebih besar pada fitur tersebut.

🏗️ **Arsitektur Model TF:**
\`Input → AttentionLayer → Dense(32, ReLU) → BatchNorm → Dropout → Dense(16, ReLU) → BatchNorm → Dropout → Dense(2, sigmoid)\`

Model juga menggunakan **Custom Loss (WeightedMAELoss)** dengan bobot fitness: 0.4, wellbeing: 0.6, serta **Custom Callback (TrainingMonitor)** untuk logging dan early stopping.`
  },

  // ── Sleep Risk / Risiko Tidur ──
  {
    keywords: ['sleep risk', 'risiko tidur', 'risk label', 'resiko tidur', 'bahaya tidur', 'gangguan tidur', 'sleep disorder', 'insomnia', 'sleep apnea'],
    title: 'Sleep Risk & Gangguan Tidur',
    answer: `**Sleep Risk Label** adalah klasifikasi tingkat risiko tidur berdasarkan data yang Anda input.

🏷️ **Kategori Risiko:**
• **Low Risk** 🟢 — Pola tidur baik, tidak ada tanda gangguan
• **Moderate Risk** 🟡 — Ada beberapa area yang perlu diperhatikan
• **High Risk** 🔴 — Indikasi kuat gangguan tidur, disarankan konsultasi medis

😴 **Gangguan Tidur yang Dikenali:**
• **None** — Tidak ada gangguan tidur terdiagnosis
• **Insomnia** — Kesulitan memulai/mempertahankan tidur. Tips: evaluasi sleep hygiene
• **Sleep Apnea** — Henti napas saat tidur. Tips: segera konsultasi dokter

⚠️ Sleep risk dihitung dari kombinasi durasi tidur, kualitas tidur, stres, dan gangguan yang dilaporkan.`
  },

  // ── Fitur Input ──
  {
    keywords: ['fitur input', 'data input', 'parameter', 'variabel', 'fitur model', 'data apa saja', 'input apa', 'apa yang diinput'],
    title: 'Data Input Model SleepWell',
    answer: `Model SleepWell membutuhkan **8 fitur input** untuk prediksi:

📊 **Fitur Numerik:**
1. **sleep_duration** — Durasi tidur dalam jam (0–24)
2. **sleep_efficiency** — Rasio waktu tidur nyata vs waktu di kasur (0.0–1.0)
3. **TotalSteps** — Jumlah langkah total hari ini
4. **VeryActiveMinutes** — Menit aktivitas fisik intens
5. **stress_level** — Level stres subjektif (1–10)
6. **sleep_quality** — Kualitas tidur subjektif (1–10)

📋 **Fitur Kategorikal:**
7. **BMI_category** — Kategori BMI: Normal atau Overweight
8. **sleep_disorder** — Gangguan tidur: None, Insomnia, atau Sleep Apnea

🎯 **Output Prediksi:**
• \`fitness_score_next_day\` — Skor kebugaran esok hari (0–100)
• \`wellbeing_next_day\` — Indeks kesejahteraan esok hari (0–100)`
  },

  // ── Sleep Efficiency ──
  {
    keywords: ['sleep efficiency', 'efisiensi tidur', 'efisiensi', 'tidur efisien', 'rasio tidur'],
    title: 'Sleep Efficiency (Efisiensi Tidur)',
    answer: `**Sleep Efficiency** adalah rasio antara waktu tidur nyata dibandingkan total waktu di kasur (skala 0.0–1.0).

📐 **Rumus:** Waktu Tidur Nyata ÷ Total Waktu di Kasur

📊 **Interpretasi:**
• **> 0.85** 🟢 Bagus — Anda tidur efisien
• **0.75–0.85** 🟡 Cukup — Tambahkan relaksasi sebelum tidur
• **< 0.75** 🔴 Rendah — Hindari layar 1 jam sebelum tidur

💡 **Tips Meningkatkan Efisiensi:**
• Jangan berbaring di kasur jika belum mengantuk
• Gunakan kasur hanya untuk tidur
• Bangun di jam yang sama setiap hari
• Kurangi paparan cahaya biru 1–2 jam sebelum tidur`
  },

  // ── Durasi Tidur ──
  {
    keywords: ['durasi tidur', 'lama tidur', 'jam tidur', 'berapa lama tidur', 'sleep duration', 'tidur berapa jam', 'waktu tidur ideal'],
    title: 'Durasi Tidur Ideal',
    answer: `**Durasi Tidur** adalah total waktu tidur Anda dalam jam.

⏰ **Rekomendasi Durasi Berdasarkan Model:**
• **< 6 jam** 🔴 Kurang — Coba tidur lebih awal 30–60 menit
• **7–9 jam** 🟢 Ideal — Pertahankan kebiasaan ini
• **> 9 jam** 🟡 Terlalu lama — Bisa berhubungan dengan kelelahan

📖 **Berdasarkan National Sleep Foundation:**
• Dewasa (18–64 tahun): 7–9 jam
• Lansia (65+): 7–8 jam
• Remaja (14–17): 8–10 jam

💡 Kualitas tidur sama pentingnya dengan durasi. Tidur 7 jam berkualitas lebih baik daripada 9 jam tapi sering terbangun.`
  },

  // ── Stres ──
  {
    keywords: ['stres', 'stress', 'stress level', 'tingkat stres', 'level stres', 'cara mengurangi stres', 'stres tinggi'],
    title: 'Stress Level & Pengaruhnya',
    answer: `**Stress Level** adalah tingkat stres subjektif pada skala 1–10.

📊 **Interpretasi:**
• **1–4** 🟢 Rendah — Kondisi mental baik
• **5–7** 🟡 Sedang — Luangkan 10 menit untuk relaksasi
• **8–10** 🔴 Tinggi — Coba teknik pernapasan atau journaling

🔗 **Pengaruh terhadap Tidur:**
Stres tinggi secara signifikan menurunkan kualitas tidur dan wellbeing index esok hari. Model ML menggunakan stress_level sebagai salah satu fitur utama prediksi.

💡 **Tips Mengurangi Stres Sebelum Tidur:**
• Teknik pernapasan 4-7-8 (hirup 4 detik, tahan 7, buang 8)
• Progressive muscle relaxation
• Journaling (tulis 3 hal yang disyukuri hari ini)
• Hindari caffeine setelah jam 2 siang`
  },

  // ── BMI ──
  {
    keywords: ['bmi', 'body mass index', 'kategori bmi', 'berat badan', 'bmi category', 'overweight', 'underweight'],
    title: 'BMI Category',
    answer: `**BMI Category** adalah kategori Indeks Massa Tubuh yang digunakan model.

📋 **Kategori yang Dikenali Model:**
• **Normal** — BMI 18.5–24.9
• **Overweight** — BMI 25+

🔗 **Hubungan BMI & Tidur:**
• Overweight dapat meningkatkan risiko Sleep Apnea
• Kurang tidur bisa menyebabkan kenaikan berat badan
• BMI mempengaruhi prediksi fitness score esok hari

💡 BMI diolah menggunakan LabelEncoder sebelum masuk ke model ML.`
  },

  // ── Langkah & Aktivitas Fisik ──
  {
    keywords: ['langkah', 'steps', 'total steps', 'aktivitas fisik', 'physical activity', 'olahraga', 'very active', 'active minutes', 'jalan kaki'],
    title: 'Aktivitas Fisik & Langkah',
    answer: `**TotalSteps** dan **VeryActiveMinutes** mengukur aktivitas fisik harian Anda.

📊 **Rekomendasi Langkah:**
• **< 5.000** 🔴 Kurang aktif — Tambah minimal 7.000 langkah/hari
• **5.000–10.000** 🟡 Cukup aktif — Terus tingkatkan
• **> 10.000** 🟢 Aktif — Pertahankan!

⚡ **VeryActiveMinutes:**
Waktu aktivitas intens (lari, angkat beban, HIIT). Rekomendasi: minimal 10–20 menit per hari.

🔗 **Pengaruh terhadap Tidur:**
• Aktivitas fisik teratur meningkatkan kualitas tidur
• Hindari olahraga intens 2–3 jam sebelum tidur
• Jalan kaki ringan setelah makan malam justru membantu tidur`
  },

  // ── Kualitas Tidur ──
  {
    keywords: ['kualitas tidur', 'sleep quality', 'tidur berkualitas', 'tidur nyenyak', 'tidur pulas'],
    title: 'Kualitas Tidur',
    answer: `**Sleep Quality** adalah penilaian subjektif kualitas tidur Anda (skala 1–10).

📊 **Interpretasi:**
• **8–10** 🟢 Sangat baik — Tidur nyenyak tanpa gangguan
• **5–7** 🟡 Cukup — Ada ruang perbaikan
• **1–4** 🔴 Buruk — Perlu evaluasi kebiasaan tidur

🔗 **Kualitas Tidur adalah Prediktor Utama Wellbeing!**
Dalam analisis model SleepWell, kualitas tidur memiliki korelasi paling kuat dengan wellbeing_next_day (R² = 0.9445).

💡 **Tips Meningkatkan Kualitas:**
• Buat jadwal tidur konsisten (tidur & bangun jam sama)
• Suhu kamar ideal: 18–22°C
• Kamar gelap dan tenang
• Hindari alkohol dan kafein sebelum tidur
• Gunakan bantal dan kasur yang nyaman`
  },

  // ── Cara Menggunakan Aplikasi ──
  {
    keywords: ['cara pakai', 'cara menggunakan', 'cara kerja', 'tutorial', 'panduan', 'bagaimana cara', 'gimana cara', 'cara konsultasi', 'cara prediksi'],
    title: 'Cara Menggunakan SleepWell AI',
    answer: `**Cara Menggunakan SleepWell AI:**

📋 **Langkah 1: Daftar & Login**
Buat akun dengan email, lalu lengkapi profil (usia, berat badan, pekerjaan).

📝 **Langkah 2: Isi Data Harian**
Buka halaman **Konsultasi**, isi data:
• Durasi & kualitas tidur tadi malam
• Jumlah langkah & aktivitas fisik hari ini
• Level stres, kategori BMI, gangguan tidur

🔮 **Langkah 3: Dapatkan Prediksi**
Klik "Prediksi & Analisis". AI akan menghitung fitness score & wellbeing index untuk esok hari.

💬 **Langkah 4: Diskusi dengan AI**
Klik "Dapatkan Saran & Rekomendasi AI" untuk berdiskusi langsung tentang hasil dan mendapatkan tips personal.

📊 **Langkah 5: Pantau di Dashboard**
Lihat tren dan riwayat prediksi Anda dari waktu ke waktu.`
  },

  // ── Tentang SleepWell ──
  {
    keywords: ['sleepwell', 'tentang', 'about', 'apa ini', 'aplikasi ini', 'siapa', 'dibuat oleh'],
    title: 'Tentang SleepWell AI',
    answer: `**SleepWell AI** adalah platform prediksi kualitas tidur dan kesejahteraan berbasis Machine Learning.

🎯 **Misi:**
Membantu pengguna tidur lebih cerdas dan hidup lebih sehat dengan analisis data-driven.

🛠️ **Teknologi:**
• **3 Model ML**: Random Forest, XGBoost, TensorFlow Deep Learning
• **Attention Layer** kustom untuk memberi bobot pada fitur paling penting
• **Groq LLM (Llama 3.3 70B)** untuk tips tidur berbasis Generative AI
• **Backend**: Express.js + Supabase
• **Frontend**: React + Tailwind CSS + Framer Motion

👥 **Tim:** CC26-PSU283 Team — DBS Foundation 2026 Capstone Project

📊 **Dataset:** Data tidur dan aktivitas fisik yang telah melalui feature engineering dengan time-series split (train: hari 1–10, test: hari 11–13).`
  },

  // ── Rekomendasi ──
  {
    keywords: ['rekomendasi', 'saran', 'tips', 'recommendation', 'apa yang harus', 'bagaimana supaya', 'cara memperbaiki', 'improve'],
    title: 'Sistem Rekomendasi SleepWell',
    answer: `SleepWell AI memberikan rekomendasi dari **2 sumber**:

🤖 **1. ML-Based Recommendations**
Dihasilkan langsung dari model Machine Learning berdasarkan pola data Anda.

📏 **2. Rule-Based Recommendations**
Saran berbasis aturan yang disesuaikan dengan input Anda:
• Durasi tidur < 6 jam → "Tidur lebih awal 30–60 menit"
• Durasi > 9 jam → "Batasi antara 7–9 jam"
• Efisiensi < 0.75 → "Hindari layar 1 jam sebelum tidur"
• Stres > 7 → "Coba teknik pernapasan atau journaling"
• Langkah < 5000 → "Tambah minimal 7.000 langkah/hari"
• Insomnia → "Konsultasikan sleep hygiene"
• Sleep Apnea → "Segera konsultasi dokter"

🎯 **Overall Level:**
• Rata-rata skor ≥ 65 → **BAIK** 🟢
• Rata-rata skor 45–64 → **SEDANG** 🟡
• Rata-rata skor < 45 → **PERLU PERHATIAN** 🔴`
  },

  // ── Groq / LLM / AI Tips ──
  {
    keywords: ['groq', 'llm', 'llama', 'generative ai', 'ai tips', 'chatbot', 'asisten ai', 'ai chat'],
    title: 'Generative AI (Groq LLM)',
    answer: `SleepWell AI menggunakan **Groq LLM (Llama 3.3 70B Versatile)** untuk fitur tips tidur cerdas.

🧠 **Kemampuan:**
• Menjawab pertanyaan spesifik tentang tidur dalam Bahasa Indonesia
• Memberikan saran berbasis sains yang personal
• Memahami konteks kesehatan tidur

💬 **Contoh Pertanyaan:**
• "Saya susah tidur setelah minum kopi sore"
• "Tips tidur untuk shift malam"
• "Bagaimana cara mengatasi jet lag?"

⚡ Jika Groq API tidak tersedia, sistem akan menggunakan tips default statis sebagai fallback.`
  },

  // ── Akurasi / Performa Model ──
  {
    keywords: ['akurasi', 'performa', 'accuracy', 'mae', 'r2', 'r²', 'error', 'seberapa akurat', 'akurat'],
    title: 'Performa & Akurasi Model',
    answer: `**Performa Model SleepWell AI:**

📊 **Wellbeing Index — Excellent ✅**
| Model | MAE | R² |
|-------|-----|-----|
| Random Forest | 1.92 | 0.9441 |
| XGBoost | 1.88 | 0.9438 |
| TensorFlow DL | 1.95 | 0.9427 |

→ Error hanya ~2% pada skala 0–100. Sangat reliabel!

📊 **Fitness Score — Keterbatasan Domain ⚠️**
| Model | MAE | R² |
|-------|------|------|
| Random Forest | 10.94 | -0.0990 |
| XGBoost | 10.70 | -0.0743 |
| TensorFlow DL | 10.25 | 0.0089 |

→ R² negatif bukan berarti model buruk. Ini karena aktivitas fisik esok hari dipengaruhi faktor eksternal (jadwal kerja, cuaca, motivasi) yang tidak ada di dataset tidur.

✅ **Kesimpulan:** Wellbeing sangat akurat (94.4%), fitness score adalah keterbatasan domain, bukan keterbatasan model.`
  },
];

// ══════════════════════════════════════════════════════════════
// 2. QUICK SUGGESTION CHIPS
// ══════════════════════════════════════════════════════════════

export const QUICK_SUGGESTIONS = [
  'Apa itu fitness score?',
  'Apa itu wellbeing index?',
  'Model ML apa yang dipakai?',
  'Bagaimana cara menggunakan app ini?',
  'Apa saja data yang diinput?',
  'Seberapa akurat prediksinya?',
  'Tips meningkatkan kualitas tidur',
  'Apa itu sleep efficiency?',
];

// ══════════════════════════════════════════════════════════════
// 3. KEYWORD MATCHING ENGINE
// ══════════════════════════════════════════════════════════════

/**
 * Normalize text for matching: lowercase, remove punctuation, trim
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate match score between user query and a knowledge entry.
 * Returns a score from 0 to 1.
 */
function calculateMatchScore(query, entry) {
  const normalizedQuery = normalize(query);
  const queryWords = normalizedQuery.split(' ');

  let bestScore = 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    const keywordWords = normalizedKeyword.split(' ');

    // Exact phrase match (highest priority)
    if (normalizedQuery.includes(normalizedKeyword)) {
      const lengthRatio = normalizedKeyword.length / normalizedQuery.length;
      const score = 0.7 + (lengthRatio * 0.3);
      bestScore = Math.max(bestScore, score);
      continue;
    }

    // Word overlap match
    let matchedWords = 0;
    for (const kw of keywordWords) {
      if (kw.length < 2) continue;
      if (queryWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
        matchedWords++;
      }
    }

    if (keywordWords.length > 0 && matchedWords > 0) {
      const overlapRatio = matchedWords / keywordWords.length;
      const score = overlapRatio * 0.65;
      bestScore = Math.max(bestScore, score);
    }
  }

  return bestScore;
}

/**
 * Try to find a local knowledge base answer for the user's query.
 * Returns { matched: true, title, answer } or { matched: false }.
 * Threshold: 0.4 minimum score to consider a match.
 */
export function findLocalAnswer(query) {
  if (!query || query.trim().length < 2) {
    return { matched: false };
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    const score = calculateMatchScore(query, entry);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestScore >= 0.4 && bestMatch) {
    return {
      matched: true,
      title: bestMatch.title,
      answer: bestMatch.answer,
      confidence: bestScore,
    };
  }

  return { matched: false };
}

export default KNOWLEDGE_BASE;
