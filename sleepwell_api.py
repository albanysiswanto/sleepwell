
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from pathlib import Path
import os
import json
import joblib
import numpy as np

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    openai = None
    OPENAI_AVAILABLE = False

from tensorflow import keras

MODEL_DIR = Path('sleepwell_models')
METADATA_PATH = MODEL_DIR / 'metadata.json'

class SleepInput(BaseModel):
    sleep_duration: float = Field(..., description='durasi tidur dalam jam')
    sleep_efficiency: float = Field(..., ge=0.0, le=1.0, description='efisiensi tidur 0-1')
    TotalSteps: float = Field(..., description='jumlah langkah hari ini')
    VeryActiveMinutes: float = Field(..., description='menit aktivitas intens')
    stress_level: float = Field(..., description='level stres 1-10')
    sleep_quality: float = Field(..., description='kualitas tidur 1-10')
    BMI_category: str = Field(..., description='Normal atau Overweight')
    sleep_disorder: str = Field(..., description='None, Insomnia, Sleep Apnea')
    model_type: Optional[str] = Field('rf', description='rf, xgb, atau tf')

class TipRequest(BaseModel):
    prompt: Optional[str] = Field(None, description='Prompt tambahan untuk Generative AI')

app = FastAPI(title='SleepWell AI API', version='1.0')

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
    base_prompt = 'Berikan rekomendasi tidur yang singkat, praktis, dan ramah.'
    if prompt:
        base_prompt += f' Tambahkan konteks: {prompt}'

    if OPENAI_AVAILABLE and os.environ.get('OPENAI_API_KEY'):
        openai.api_key = os.environ['OPENAI_API_KEY']
        response = openai.ChatCompletion.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': 'Kamu adalah asisten tidur sehat.'},
                {'role': 'user', 'content': base_prompt}
            ],
            temperature=0.8,
            max_tokens=220
        )
        return response.choices[0].message.content.strip()

    return (
        'Coba tidur lebih awal 30 menit, matikan layar 1 jam sebelum tidur, dan lakukan relaksasi ringan sebelum tidur.'
    )

@app.get('/health')
def health_check():
    return {'status': 'healthy', 'model_directory': str(MODEL_DIR)}

@app.post('/predict')
def predict(payload: SleepInput):
    return predict_model(payload)

@app.post('/recommend')
def recommend(payload: SleepInput):
    prediction = predict_model(payload)
    return {'prediction': prediction, 'recommendation': generate_recommendations(payload, prediction)}

@app.post('/tips')
def tips(request: TipRequest):
    return {'tip': get_sleep_tips(request.prompt)}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('sleepwell_api:app', host='0.0.0.0', port=8000, reload=False)
