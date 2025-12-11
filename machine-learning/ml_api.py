import sys
import pandas as pd
import numpy as np
import joblib
import json
import os
import warnings
from flask import Flask, request, jsonify
from shap_logic.shap_service import LeadScoringSHAPService

warnings.filterwarnings("ignore")

app = Flask(__name__)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "ML API is active"})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(BASE_DIR, 'model/BEST_MODEL.pkl')
SCALER_FILE = os.path.join(BASE_DIR, 'model/scaler.pkl')
ENCODER_FILE = os.path.join(BASE_DIR, 'model/onehot_encoder.pkl')
FEATURE_NAMES_FILE = os.path.join(BASE_DIR, 'model/feature_names.pkl')

model = None
scaler = None
encoder = None
feature_names = []
shap_service = None

def load_artifacts():
    global model, scaler, encoder, feature_names, shap_service
    try:
        if not os.path.exists(MODEL_FILE):
            raise FileNotFoundError(f"Model file not found at {MODEL_FILE}")
        model = joblib.load(MODEL_FILE)
        scaler = joblib.load(SCALER_FILE)
        encoder = joblib.load(ENCODER_FILE)

        if os.path.exists(FEATURE_NAMES_FILE):
            feature_names = joblib.load(FEATURE_NAMES_FILE)
        else:
            print(f"⚠️ Feature names file not found. attempting to reconstruction...")
            if hasattr(model, 'feature_names_in_'):
                feature_names = list(model.feature_names_in_)
                print(f"✅ Recovered {len(feature_names)} feature names from model metadata.")
            else:
                try:
                    numeric_cols = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
                    categorical_cols = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]
                    if hasattr(encoder, 'get_feature_names_out'):
                        encoded_categs = list(encoder.get_feature_names_out(categorical_cols))
                    else:
                        encoded_categs = list(encoder.get_feature_names(categorical_cols))
                    feature_names = numeric_cols + encoded_categs
                    print(f"✅ Reconstructed {len(feature_names)} feature names from encoder.")
                except Exception as ex:
                    print(f"❌ Failed to reconstruct feature names: {ex}")
                    feature_names = []

        print(f"✅ Artifacts loaded successfully from {BASE_DIR}")

        if model is not None and feature_names:
            shap_service = LeadScoringSHAPService(model, feature_names)
            print("✅ SHAP Service initialized.")
        else:
            print("⚠️ SHAP Service not initialized due to missing model or feature names.")

    except Exception as e:
        print(f"❌ Failed to load artifacts: {str(e)}")
        sys.exit(1)

from huggingface_hub import hf_hub_download
import os

HF_REPO_ID = os.getenv("HF_REPO_ID")

def download_models_from_hf():
    if not HF_REPO_ID:
        print("ℹ️ HF_REPO_ID not set. Skipping Hugging Face download.")
        return

    print(f"⬇️ Attempting to download models from Hugging Face repo: {HF_REPO_ID}")
    files_to_download = ["BEST_MODEL.pkl", "scaler.pkl", "onehot_encoder.pkl"]

    os.makedirs(os.path.join(BASE_DIR, 'model'), exist_ok=True)

    for filename in files_to_download:
        destination = os.path.join(BASE_DIR, 'model', filename)

        should_download = True
        if os.path.exists(destination):
            file_size = os.path.getsize(destination)
            if file_size > 2048:
                should_download = False
                print(f"   ℹ️ {filename} exists and seems valid ({file_size} bytes).")
            else:
                print(f"   ⚠️ {filename} exists but is too small ({file_size} bytes). Likely an LFS pointer. Re-downloading...")

        if should_download:
            try:
                print(f"   Downloading {filename}...")
                downloaded_path = hf_hub_download(
                    repo_id=HF_REPO_ID,
                    filename=filename,
                )

                import shutil
                shutil.copy(downloaded_path, destination)
                print(f"   ✅ Downloaded {filename} to {destination}")
            except Exception as e:
                print(f"   ❌ Failed to download {filename}: {e}")

download_models_from_hf()

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
    file_obj = None
    if 'file' in request.files:
        file_obj = request.files['file']
    else:
        data = request.get_json(silent=True)
        if data and 'file_path' in data:
            if os.path.exists(data['file_path']):
                return process_csv_logic(data['file_path'], data.get('limit'))
            else:
                return jsonify({"error": "File path not found (Services are isolated?)"}), 404
    if not file_obj:
        return jsonify({"error": "No file provided"}), 400

    try:
        temp_filename = f"temp_upload_{os.getpid()}.csv"
        temp_path = os.path.join(BASE_DIR, temp_filename)
        file_obj.save(temp_path)

        limit = request.form.get('limit')
        result = process_csv_logic(temp_path, limit)

        if os.path.exists(temp_path):
            os.remove(temp_path)
        if isinstance(result, dict) and "error" in result:
             return jsonify(result), 500
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Failed to process upload: {str(e)}"}), 500

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



@app.route('/explain', methods=['POST'])
def explain():
    """Generate SHAP explanation for a single lead"""
    global shap_service

    if shap_service is None:
        return jsonify({"error": "SHAP service not available", "success": False}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "success": False}), 400

    try:
        single_data = {
            'age': int(data.get('age', 30)),
            'balance': int(data.get('balance', 0)),
            'day': int(data.get('day', 1)),
            'duration': int(data.get('duration', 0)),
            'campaign': int(data.get('campaign', 0)),
            'pdays': int(data.get('pdays', 999)),
            'previous': int(data.get('previous', 0)),
            'job': str(data.get('job', 'unknown')),
            'marital': str(data.get('marital', 'unknown')),
            'education': str(data.get('education', 'unknown')),
            'default': str(data.get('default', 'no')),
            'housing': str(data.get('housing', 'no')),
            'loan': str(data.get('loan', 'no')),
            'contact': str(data.get('contact', 'unknown')),
            'month': str(data.get('month', 'jan')),
            'poutcome': str(data.get('poutcome', 'unknown')),
        }

        df = pd.DataFrame([single_data])

        numeric_features_model_order = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
        numeric_features_scaler_order = ["age", "balance", "campaign", "pdays", "previous", "day", "duration"]
        categorical_cols = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]

        X_raw = df[numeric_features_model_order + categorical_cols].copy()
        X_raw = X_raw.replace('unknown', np.nan).replace('Unknown', np.nan)

        for col in numeric_features_model_order:
            X_raw[col] = X_raw[col].fillna(-1 if col == 'pdays' else 0)
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

        print(f"DEBUG: shap_service type: {type(shap_service)}")
        explanation = shap_service.explain(X_processed, single_data)

        print(f"✅ Explain completed for prediction: {prediction:.2%}")

        return jsonify({
            "success": True,
            "prediction": float(prediction),
            "prediction_pct": float(prediction * 100),
            **explanation
        })

    except Exception as e:
        print(f"❌ SHAP explanation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Explanation failed: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
