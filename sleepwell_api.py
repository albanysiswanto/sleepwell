
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from pathlib import Path
import os
import json
import joblib
import numpy as np

from dotenv import load_dotenv
load_dotenv()

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    Groq = None
    GROQ_AVAILABLE = False

from tensorflow import keras

MODEL_DIR = Path('sleepwell_models')
METADATA_PATH = MODEL_DIR / 'metadata.json'

class SleepInput(BaseModel):
    """Data input tidur dan aktivitas harian pengguna untuk prediksi."""
    sleep_duration: float = Field(
        ..., ge=0.0, le=24.0,
        description='Durasi tidur dalam jam (contoh: 7.5)',
        json_schema_extra={'examples': [7.5]}
    )
    sleep_efficiency: float = Field(
        ..., ge=0.0, le=1.0,
        description='Efisiensi tidur (0.0 - 1.0). Rasio waktu tidur nyata vs waktu di kasur (contoh: 0.88)',
        json_schema_extra={'examples': [0.88]}
    )
    TotalSteps: float = Field(
        ..., ge=0.0,
        description='Jumlah langkah total hari ini dari fitness tracker (contoh: 8500)',
        json_schema_extra={'examples': [8500]}
    )
    VeryActiveMinutes: float = Field(
        ..., ge=0.0,
        description='Menit aktivitas fisik intens hari ini (contoh: 25)',
        json_schema_extra={'examples': [25]}
    )
    stress_level: float = Field(
        ..., ge=1.0, le=10.0,
        description='Level stres subjektif (1 = sangat rendah, 10 = sangat tinggi)',
        json_schema_extra={'examples': [5]}
    )
    sleep_quality: float = Field(
        ..., ge=1.0, le=10.0,
        description='Kualitas tidur subjektif (1 = sangat buruk, 10 = sangat baik)',
        json_schema_extra={'examples': [7]}
    )
    BMI_category: str = Field(
        ...,
        description='Kategori BMI pengguna. Pilihan: "Normal" atau "Overweight"',
        json_schema_extra={'examples': ['Normal']}
    )
    sleep_disorder: str = Field(
        ...,
        description='Gangguan tidur yang didiagnosis. Pilihan: "None", "Insomnia", atau "Sleep Apnea"',
        json_schema_extra={'examples': ['None']}
    )
    model_type: Optional[str] = Field(
        'rf',
        description='Jenis model ML untuk prediksi. Pilihan: "rf" (Random Forest), "xgb" (XGBoost), atau "tf" (TensorFlow Deep Learning)',
        json_schema_extra={'examples': ['rf']}
    )

    model_config = {
        'json_schema_extra': {
            'examples': [{
                'sleep_duration': 7.5,
                'sleep_efficiency': 0.88,
                'TotalSteps': 8500,
                'VeryActiveMinutes': 25,
                'stress_level': 5,
                'sleep_quality': 7,
                'BMI_category': 'Normal',
                'sleep_disorder': 'None',
                'model_type': 'rf'
            }]
        }
    }

class TipRequest(BaseModel):
    """Request body untuk mendapatkan tips tidur dari Generative AI."""
    prompt: Optional[str] = Field(
        None,
        description='Pertanyaan atau konteks spesifik tentang masalah tidur Anda. Kosongkan untuk tips umum.',
        json_schema_extra={'examples': ['Saya sering terbangun jam 3 pagi']}
    )

    model_config = {
        'json_schema_extra': {
            'examples': [
                {'prompt': 'Saya sering terbangun jam 3 pagi'},
                {'prompt': 'Tips tidur untuk shift malam'},
                {'prompt': None}
            ]
        }
    }

tags_metadata = [
    {
        'name': 'Health',
        'description': 'Cek status server dan konektivitas model.'
    },
    {
        'name': 'Prediction',
        'description': 'Prediksi skor fitness dan wellbeing esok hari berdasarkan data tidur dan aktivitas hari ini.'
    },
    {
        'name': 'Recommendation',
        'description': 'Prediksi + rekomendasi personalisasi berbasis rule-based dan ML.'
    },
    {
        'name': 'Generative AI',
        'description': 'Tips tidur cerdas menggunakan **Groq LLM (Llama 3.3 70B)**. '
                       'Mendukung pertanyaan spesifik dalam Bahasa Indonesia.'
    }
]

app = FastAPI(
    title='SleepWell AI API',
    version='1.0.0',
    description=(
        '## Tentang\n'
        'SleepWell AI adalah REST API untuk **prediksi kualitas tidur** dan **rekomendasi kesehatan tidur** '
        'menggunakan Machine Learning (Random Forest, XGBoost, TensorFlow) dan Generative AI (Groq LLM).\n\n'
        '## Cara Penggunaan\n'
        '1. **`/predict`** — Kirim data tidur Anda, dapatkan prediksi skor fitness & wellbeing esok hari\n'
        '2. **`/recommend`** — Sama seperti predict, ditambah rekomendasi personal\n'
        '3. **`/tips`** — Tanya tips tidur ke AI (powered by Llama 3.3 70B via Groq)\n\n'
        '## Model yang Tersedia\n'
        '| Model | Kode | Deskripsi |\n'
        '|---|---|---|\n'
        '| Random Forest | `rf` | Model ensemble, cepat dan stabil |\n'
        '| XGBoost | `xgb` | Gradient boosting, performa tinggi |\n'
        '| TensorFlow DL | `tf` | Deep Learning dengan Attention Layer |\n'
    ),
    openapi_tags=tags_metadata,
    contact={
        'name': 'SleepWell AI Team',
    },
)

groq_client = None
if GROQ_AVAILABLE and os.environ.get('GROQ_API_KEY'):
    groq_client = Groq(api_key=os.environ['GROQ_API_KEY'])

if not MODEL_DIR.exists() or not METADATA_PATH.exists():
    raise FileNotFoundError('sleepwell_models folder atau metadata.json tidak ditemukan. Jalankan export model terlebih dahulu.')

metadata = json.loads(METADATA_PATH.read_text())

SCALER_PATH      = MODEL_DIR / 'scaler.pkl'
LE_BMI_PATH      = MODEL_DIR / 'le_bmi.pkl'
LE_DISORDER_PATH = MODEL_DIR / 'le_disorder.pkl'
RF_PATH          = MODEL_DIR / 'rf_model.pkl'
XGB_PATH         = MODEL_DIR / 'xgb_model.pkl'
TF_PATH          = MODEL_DIR / 'tf_model.keras'

scaler = joblib.load(SCALER_PATH)
le_bmi = joblib.load(LE_BMI_PATH)
le_disorder = joblib.load(LE_DISORDER_PATH)

tf_model = None


def load_tf_model():
    global tf_model
    if tf_model is None:
        tf_model = keras.models.load_model(str(TF_PATH), custom_objects={})
    return tf_model


def prepare_features(payload: SleepInput):
    try:
        bmi_encoded = int(le_bmi.transform([payload.BMI_category])[0])
        disorder_encoded = int(le_disorder.transform([payload.sleep_disorder])[0])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Invalid categorical value: {exc}')

    features = np.array([[
        payload.sleep_duration,
        payload.sleep_efficiency,
        payload.TotalSteps,
        payload.VeryActiveMinutes,
        payload.stress_level,
        payload.sleep_quality,
        bmi_encoded,
        disorder_encoded
    ]], dtype=np.float32)

    if payload.model_type == 'tf':
        return scaler.transform(features)
    return features


def predict_model(payload: SleepInput):
    model_type = payload.model_type.lower()
    if model_type == 'rf':
        model = joblib.load(str(RF_PATH))
        pred = model.predict(prepare_features(payload))[0]
    elif model_type == 'xgb':
        model = joblib.load(str(XGB_PATH))
        pred = model.predict(prepare_features(payload))[0]
    elif model_type == 'tf':
        model = load_tf_model()
        pred_scaled = model.predict(prepare_features(payload), verbose=0)[0]
        pred = np.array([
            float(np.clip(pred_scaled[0], 0, 100)),
            float(np.clip(pred_scaled[1], 0, 100))
        ])
    else:
        raise HTTPException(status_code=400, detail='model_type harus rf, xgb, atau tf')

    return {
        'fitness_score_next_day': float(np.round(pred[0], 2)),
        'wellbeing_next_day': float(np.round(pred[1], 2))
    }


def generate_recommendations(payload: SleepInput, prediction: dict):
    recs = []
    fitness = prediction['fitness_score_next_day']
    wellbeing = prediction['wellbeing_next_day']

    if payload.sleep_duration < 6:
        recs.append('Durasi tidur kurang, coba tidur lebih awal 30-60 menit.')
    elif payload.sleep_duration > 9:
        recs.append('Terlalu lama tidur. Coba batasi antara 7-9 jam.')
    else:
        recs.append('Durasi tidur sudah ideal. Pertahankan kebiasaan ini.')

    if payload.sleep_efficiency < 0.75:
        recs.append('Efisiensi tidur rendah. Hindari layar 1 jam sebelum tidur.')
    elif payload.sleep_efficiency < 0.85:
        recs.append('Efisiensi cukup baik. Tambahkan relaksasi sebelum tidur.')
    else:
        recs.append('Efisiensi tidur bagus. Lanjutkan kebiasaan positif ini.')

    if payload.stress_level > 7:
        recs.append('Stres tinggi. Coba teknik pernapasan atau journaling.')
    elif payload.stress_level > 5:
        recs.append('Stres sedang. Luangkan waktu 10 menit untuk relaksasi.')

    if payload.TotalSteps < 5000:
        recs.append('Tambah aktivitas fisik minimal 7.000 langkah sehari.')
    if payload.VeryActiveMinutes < 10:
        recs.append('Tambahkan 10-20 menit aktivitas intens per hari.')

    if payload.sleep_disorder == 'Insomnia':
        recs.append('Konsultasikan sleep hygiene dan evaluasi medis.')
    elif payload.sleep_disorder == 'Sleep Apnea':
        recs.append('Segera konsultasikan dengan dokter.')

    avg_score = (fitness + wellbeing) / 2
    level = 'BAIK 🟢'
    summary = 'Kondisi diprediksi baik esok hari.'
    if avg_score < 45:
        level = 'PERLU PERHATIAN 🔴'
        summary = 'Kondisi perlu perhatian ekstra. Kurangi stres dan prioritaskan tidur.'
    elif avg_score < 65:
        level = 'SEDANG 🟡'
        summary = 'Masih ada ruang perbaikan. Ikuti rekomendasi yang diberikan.'

    return {
        'overall_level': level,
        'summary': summary,
        'recommendations': recs,
        'fitness_score_next_day': float(np.round(fitness, 2)),
        'wellbeing_next_day': float(np.round(wellbeing, 2))
    }


def get_sleep_tips(prompt: Optional[str] = None) -> str:
    base_prompt = 'Berikan rekomendasi tidur yang singkat, praktis, dan ramah dalam Bahasa Indonesia.'
    if prompt:
        base_prompt += f' Tambahkan konteks: {prompt}'

    if groq_client is not None:
        try:
            response = groq_client.chat.completions.create(
                model='llama-3.3-70b-versatile',
                messages=[
                    {'role': 'system', 'content': 'Kamu adalah asisten kesehatan tidur profesional bernama SleepWell AI. Berikan saran yang singkat, praktis, berbasis sains, dan ramah dalam Bahasa Indonesia.'},
                    {'role': 'user', 'content': base_prompt}
                ],
                temperature=0.8,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f'Groq API error, menggunakan tips default. Error: {str(e)}'

    return (
        'Coba tidur lebih awal 30 menit, matikan layar 1 jam sebelum tidur, dan lakukan relaksasi ringan sebelum tidur.'
    )

@app.get(
    '/health',
    tags=['Health'],
    summary='Cek Status Server',
    response_description='Status server dan direktori model'
)
def health_check():
    """Mengecek apakah server berjalan dan model sudah ter-load dengan benar."""
    return {
        'status': 'healthy',
        'model_directory': str(MODEL_DIR),
        'groq_connected': groq_client is not None
    }

@app.post(
    '/predict',
    tags=['Prediction'],
    summary='Prediksi Skor Esok Hari',
    response_description='Prediksi fitness_score dan wellbeing untuk esok hari (skala 0-100)'
)
def predict(payload: SleepInput):
    """
    Memprediksi **fitness_score_next_day** dan **wellbeing_next_day** berdasarkan data tidur hari ini.

    - **fitness_score_next_day**: Skor aktivitas fisik prediksi esok hari (0-100)
    - **wellbeing_next_day**: Skor kesejahteraan prediksi esok hari (0-100)

    Pilih model via field `model_type`: `rf`, `xgb`, atau `tf`.
    """
    return predict_model(payload)

@app.post(
    '/recommend',
    tags=['Recommendation'],
    summary='Prediksi + Rekomendasi Personal',
    response_description='Prediksi skor beserta rekomendasi tidur yang dipersonalisasi'
)
def recommend(payload: SleepInput):
    """
    Menggabungkan **prediksi ML** dengan **rekomendasi rule-based** yang dipersonalisasi.

    Response mencakup:
    - `prediction`: Skor fitness & wellbeing
    - `recommendation`: Level kondisi (🟢🟡🔴), ringkasan, dan daftar saran spesifik

    Rekomendasi disesuaikan berdasarkan: durasi tidur, efisiensi, stres, langkah, dan gangguan tidur.
    """
    prediction = predict_model(payload)
    return {
        'prediction': prediction,
        'recommendation': generate_recommendations(payload, prediction)
    }

@app.post(
    '/tips',
    tags=['Generative AI'],
    summary='Tips Tidur dari AI',
    response_description='Tips tidur yang dihasilkan oleh Groq LLM (Llama 3.3 70B)'
)
def tips(request: TipRequest):
    """
    Menghasilkan **tips tidur cerdas** menggunakan Generative AI (Groq — Llama 3.3 70B).

    - Kirim `prompt` kosong (`null`) untuk mendapatkan tips tidur umum
    - Kirim `prompt` berisi pertanyaan spesifik untuk saran yang lebih personal

    **Contoh prompt:**
    - *"Saya susah tidur setelah minum kopi sore"*
    - *"Tips tidur untuk ibu hamil"*
    - *"Bagaimana cara mengatasi jet lag?"*

    > Jika Groq API tidak tersedia, akan menggunakan tips default (statis).
    """
    return {'tip': get_sleep_tips(request.prompt)}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('sleepwell_api:app', host='0.0.0.0', port=8000, reload=False)
