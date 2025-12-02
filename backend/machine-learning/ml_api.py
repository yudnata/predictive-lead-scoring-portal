import sys
import pandas as pd
import numpy as np
import joblib
import json
import os
import warnings
from flask import Flask, request, jsonify

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
warnings.filterwarnings("ignore")

from tensorflow.keras.models import load_model

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, 'lead_scoring_mlp.h5')
SCALER_FILE = os.path.join(BASE_DIR, 'scaler.pkl')
ENCODER_FILE = os.path.join(BASE_DIR, 'encoders.pkl')

model = None
scaler = None
encoders = None

def load_artifacts():
    global model, scaler, encoders
    try:
        if not os.path.exists(MODEL_FILE):
            raise FileNotFoundError(f"Model file not found at {MODEL_FILE}")

        model = load_model(MODEL_FILE)
        scaler = joblib.load(SCALER_FILE)
        encoders = joblib.load(ENCODER_FILE)
    except Exception as e:
        sys.exit(1)

load_artifacts()

def process_csv_logic(csv_path, limit=None):
    try:
        nrows = int(limit) if limit else None
        df = pd.read_csv(csv_path, sep=None, engine='python', nrows=nrows)
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        return {"error": f"Gagal membaca CSV: {str(e)}"}

    num_cols = ['age', 'balance', 'campaign', 'pdays', 'previous']
    missing = [c for c in num_cols if c not in df.columns]
    if missing:
        return {"error": f"Kolom wajib hilang di CSV: {missing}"}

    df_nums = df[num_cols].copy()
    df_nums['age'] = pd.to_numeric(df_nums['age'], errors='coerce').fillna(30)
    df_nums['balance'] = pd.to_numeric(df_nums['balance'], errors='coerce').fillna(0)
    df_nums['campaign'] = pd.to_numeric(df_nums['campaign'], errors='coerce').fillna(1)
    df_nums['pdays'] = pd.to_numeric(df_nums['pdays'], errors='coerce').fillna(-1)
    df_nums['previous'] = pd.to_numeric(df_nums['previous'], errors='coerce').fillna(0)

    try:
        X_num = scaler.transform(df_nums)
    except Exception as e:
        return {"error": f"Scaling error: {str(e)}"}

    X_final = []

    def encode(col_name, val):
        le = encoders.get(col_name)
        if not le: return 0
        val_str = str(val).lower().strip()
        if val_str in le.classes_:
            return le.transform([val_str])[0]
        if 'unknown' in le.classes_:
            return le.transform(['unknown'])[0]
        return 0

    for i, row in df.iterrows():
        age_s, bal_s, camp_s, pdays_s, prev_s = X_num[i]

        job_v = encode('job', row.get('job', 'unknown'))
        mar_v = encode('marital', row.get('marital', 'single'))
        edu_v = encode('education', row.get('education', 'secondary'))
        def_v = encode('default', row.get('default', 'no'))
        hou_v = encode('housing', row.get('housing', 'no'))
        loa_v = encode('loan', row.get('loan', 'no'))
        con_v = encode('contact', row.get('contact', 'cellular'))
        mon_v = encode('month', row.get('month', 'may'))
        pou_v = encode('poutcome', row.get('poutcome', 'unknown'))

        features = [
            age_s, job_v, mar_v, edu_v, def_v,
            bal_s, hou_v, loa_v, con_v, mon_v,
            camp_s, pdays_s, prev_s, pou_v
        ]
        X_final.append(features)

    X_final = np.array(X_final)

    try:
        predictions = model.predict(X_final, verbose=0)
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}

    results = []
    for i, pred in enumerate(predictions):
        score = float(pred[0])
        row_data = df.iloc[i].to_dict()
        clean_row = {k: (v if pd.notna(v) else None) for k, v in row_data.items()}
        results.append({**clean_row, "ml_score": score})

    return results

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'file_path' not in data:
        return jsonify({"error": "No file_path provided"}), 400

    file_path = data['file_path']

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    limit = data.get('limit')
    result = process_csv_logic(file_path, limit)

    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 500

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
