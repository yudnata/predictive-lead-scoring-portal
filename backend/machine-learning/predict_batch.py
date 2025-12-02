import sys
import pandas as pd
import numpy as np
import joblib
import json
import os
import warnings

# Supress TF warnings agar tidak mengotori output JSON
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
warnings.filterwarnings("ignore")

from tensorflow.keras.models import load_model

# --- KONFIGURASI PATH ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, 'lead_scoring_mlp.h5')
SCALER_FILE = os.path.join(BASE_DIR, 'scaler.pkl')
ENCODER_FILE = os.path.join(BASE_DIR, 'encoders.pkl')

def log_debug(msg):
    # Log ini muncul di terminal Node.js (stderr)
    print(f"🐍 [ML-DEBUG] {msg}", file=sys.stderr, flush=True)

# --- LOAD ARTIFACTS ---
if not os.path.exists(MODEL_FILE):
    print(json.dumps({"error": f"Model file not found at {MODEL_FILE}"}))
    sys.exit(1)

try:
    model = load_model(MODEL_FILE)
    scaler = joblib.load(SCALER_FILE)
    encoders = joblib.load(ENCODER_FILE)
except Exception as e:
    print(json.dumps({"error": f"Gagal load model/scaler: {str(e)}"}))
    sys.exit(1)

def process_csv(csv_path, log_every=1000):
    try:
        df = pd.read_csv(csv_path, sep=None, engine='python')
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        return {"error": f"Gagal membaca CSV: {str(e)}"}

    # --- NUMERIC FEATURES ---
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

    # --- CATEGORICAL FEATURES ---
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
        # Numeric scaled
        age_s, bal_s, camp_s, pdays_s, prev_s = X_num[i]

        # Categorical encode
        job_v = encode('job', row.get('job', 'unknown'))
        mar_v = encode('marital', row.get('marital', 'single'))
        edu_v = encode('education', row.get('education', 'secondary'))
        def_v = encode('default', row.get('default', 'no'))
        hou_v = encode('housing', row.get('housing', 'no'))
        loa_v = encode('loan', row.get('loan', 'no'))
        con_v = encode('contact', row.get('contact', 'cellular'))
        mon_v = encode('month', row.get('month', 'may'))
        pou_v = encode('poutcome', row.get('poutcome', 'unknown'))  # <-- FIX fitur ke-14

        # Susun feature vector sesuai urutan training
        features = [
            age_s, job_v, mar_v, edu_v, def_v,
            bal_s, hou_v, loa_v, con_v, mon_v,
            camp_s, pdays_s, prev_s, pou_v  # 14 fitur
        ]
        X_final.append(features)

        # Logging progress setiap log_every baris
        if (i + 1) % log_every == 0:
            log_debug(f"Processed {i + 1}/{len(df)} rows...")

    X_final = np.array(X_final)

    # --- PREDIKSI ---
    try:
        predictions = model.predict(X_final, verbose=0)
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}

    log_debug(f"Total {len(predictions)} rows predicted.")

    results = []
    for i, pred in enumerate(predictions):
        score = float(pred[0])
        row_data = df.iloc[i].to_dict()
        clean_row = {k: (v if pd.notna(v) else None) for k, v in row_data.items()}
        results.append({**clean_row, "ml_score": score})

    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No CSV file passed"}))
        sys.exit(1)

    output = process_csv(sys.argv[1], log_every=1000)
    print(json.dumps(output))
