import sys
import pandas as pd
import numpy as np
import joblib
import json
import os
import warnings
from flask import Flask, request, jsonify

warnings.filterwarnings("ignore")

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, 'model/BEST_MODEL.pkl')
SCALER_FILE = os.path.join(BASE_DIR, 'model/scaler.pkl')
ENCODER_FILE = os.path.join(BASE_DIR, 'model/onehot_encoder.pkl')

model = None
scaler = None
encoder = None

def load_artifacts():
    global model, scaler, encoder
    try:
        if not os.path.exists(MODEL_FILE):
            raise FileNotFoundError(f"Model file not found at {MODEL_FILE}")
        model = joblib.load(MODEL_FILE)
        scaler = joblib.load(SCALER_FILE)
        encoder = joblib.load(ENCODER_FILE)
        print(f"✅ Artifacts loaded successfully from {BASE_DIR}")
    except Exception as e:
        print(f"❌ Failed to load artifacts: {str(e)}")
        sys.exit(1)

load_artifacts()

def process_csv_logic(csv_path, limit=None):
    try:
        nrows = int(limit) if limit else None
        df = pd.read_csv(csv_path, sep=None, engine='python', nrows=nrows)
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        return {"error": f"Gagal membaca CSV: {str(e)}"}

    numeric_features_model_order = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
    numeric_features_scaler_order = ["age", "balance", "campaign", "pdays", "previous", "day", "duration"]
    categorical_cols = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]

    all_expected = numeric_features_model_order + categorical_cols
    missing = [c for c in all_expected if c not in df.columns]
    if missing:
        return {"error": f"Kolom wajib hilang di CSV: {missing}"}

    X_raw = df[all_expected].copy()

    X_raw = X_raw.replace('unknown', np.nan)
    X_raw = X_raw.replace('Unknown', np.nan)

    for col in numeric_features_model_order:
        if col == 'pdays':
             X_raw[col] = X_raw[col].fillna(-1)
        else:
             X_raw[col] = X_raw[col].fillna(0)
    for col in categorical_cols:
        X_raw[col] = X_raw[col].fillna('unknown')

    if "pdays" in X_raw.columns:
        X_raw["pdays"] = X_raw["pdays"].replace(999, -1)

    try:
        encoded_arr = encoder.transform(X_raw[categorical_cols])
        encoded_cols = encoder.get_feature_names_out(categorical_cols)
        df_encoded = pd.DataFrame(encoded_arr, columns=encoded_cols, index=X_raw.index)
    except Exception as e:
        return {"error": f"Encoding error: {str(e)}"}

    try:
        X_processed = pd.concat([X_raw[numeric_features_model_order], df_encoded], axis=1)
        X_processed[numeric_features_scaler_order] = scaler.transform(X_processed[numeric_features_scaler_order])
    except Exception as e:
        return {"error": f"Scaling error: {str(e)}"}

    try:
        if hasattr(model, "feature_names_in_"):
            try:
                X_processed = X_processed[model.feature_names_in_]
            except KeyError as e:
                missing_cols = set(model.feature_names_in_) - set(X_processed.columns)
                return {"error": f"Model expects features that are missing: {missing_cols}"}
        else:
            X_processed = X_processed.values

        if hasattr(model, "predict_proba"):
            predictions = model.predict_proba(X_processed)[:, 1]
        else:
            predictions = model.predict(X_processed)
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}

    results = []
    for i, score in enumerate(predictions):
        row_data = df.iloc[i].to_dict()
        clean_row = {k: (v if pd.notna(v) else None) for k, v in row_data.items()}
        results.append({
            **clean_row,
            "ml_score": float(score)
        })

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

@app.route('/predict_single', methods=['POST'])
def predict_single():
    """Predict score for a single lead"""
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        single_data = {
            'age': int(data.get('age', 30)),
            'balance': int(data.get('balance', 0)),
            'day': int(data.get('day', 1)),
            'duration': int(data.get('duration', 0)),
            'campaign': int(data.get('campaign', 0)),
            'pdays': int(data.get('pdays', 999)),
            'previous': int(data.get('previous', 0)),
            'job': str(data.get('job', 1)),
            'marital': str(data.get('marital', 1)),
            'education': str(data.get('education', 1)),
            'default': str(data.get('default', 0)),
            'housing': str(data.get('housing', 0)),
            'loan': str(data.get('loan', 0)),
            'contact': str(data.get('contact', 'unknown')),
            'month': str(data.get('month', 1)),
            'poutcome': str(data.get('poutcome', 0)),
        }

        df = pd.DataFrame([single_data])


        numeric_features_model_order = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
        numeric_features_scaler_order = ["age", "balance", "campaign", "pdays", "previous", "day", "duration"]
        categorical_cols = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]

        X_raw = df[numeric_features_model_order + categorical_cols].copy()

        X_raw = X_raw.replace('unknown', np.nan)
        X_raw = X_raw.replace('Unknown', np.nan)

        for col in numeric_features_model_order:
            if col == 'pdays':
                X_raw[col] = X_raw[col].fillna(-1)
            else:
                X_raw[col] = X_raw[col].fillna(0)
        for col in categorical_cols:
            X_raw[col] = X_raw[col].fillna('unknown')

        if "pdays" in X_raw.columns:
            X_raw["pdays"] = X_raw["pdays"].replace(999, -1)

        encoded_arr = encoder.transform(X_raw[categorical_cols])
        encoded_cols = encoder.get_feature_names_out(categorical_cols)
        df_encoded = pd.DataFrame(encoded_arr, columns=encoded_cols, index=X_raw.index)

        X_processed = pd.concat([X_raw[numeric_features_model_order], df_encoded], axis=1)
        X_processed[numeric_features_scaler_order] = scaler.transform(X_processed[numeric_features_scaler_order])

        if hasattr(model, "feature_names_in_"):
            X_processed = X_processed[model.feature_names_in_]

        if hasattr(model, "predict_proba"):
            prediction = model.predict_proba(X_processed)[0, 1]
        else:
            prediction = model.predict(X_processed)[0]

        return jsonify({
            "prediction": float(prediction),
            "success": True
        })

    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return jsonify({
            "error": f"Prediction failed: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
