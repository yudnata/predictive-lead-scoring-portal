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

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "ML API is active"})

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

shap_service = None

def init_shap_service():
    """Initialize SHAP service after model is loaded"""
    global shap_service
    try:
        import shap
        if hasattr(model, 'feature_names_in_'):
            feature_names = list(model.feature_names_in_)
        else:
            feature_names = [f"feature_{i}" for i in range(100)]

        shap_service = shap.TreeExplainer(model)
        print(f"✅ SHAP explainer initialized with {len(feature_names)} features")
        return feature_names
    except Exception as e:
        print(f"⚠️ SHAP initialization failed: {str(e)}")
        return None

shap_feature_names = init_shap_service()

@app.route('/explain', methods=['POST'])
def explain():
    """Generate SHAP explanation for a single lead"""
    global shap_service, shap_feature_names

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

        shap_values = shap_service.shap_values(X_processed)

        if isinstance(shap_values, list) and len(shap_values) == 2:
            shap_vals = shap_values[1][0]
            base_value = float(shap_service.expected_value[1])
        elif hasattr(shap_values, 'shape') and len(shap_values.shape) == 3:
            shap_vals = shap_values[0, :, 1]
            base_value = float(shap_service.expected_value[1])
        else:
            shap_vals = shap_values[0] if hasattr(shap_values, '__getitem__') else shap_values
            base_value = float(shap_service.expected_value) if not isinstance(shap_service.expected_value, (list, np.ndarray)) else float(shap_service.expected_value[0])

        if not isinstance(shap_vals, np.ndarray):
            shap_vals = np.array(shap_vals)

        shap_sum = float(np.sum(shap_vals))
        calculated_prediction = base_value + shap_sum

        feature_names = list(X_processed.columns) if hasattr(X_processed, 'columns') else shap_feature_names

        active_features = set()
        for num_feat in ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]:
            active_features.add(num_feat)
        categorical_values = {
            'job': single_data['job'],
            'marital': single_data['marital'],
            'education': single_data['education'],
            'default': single_data['default'],
            'housing': single_data['housing'],
            'loan': single_data['loan'],
            'contact': single_data['contact'],
            'month': single_data['month'],
            'poutcome': single_data['poutcome'],
        }
        for cat, val in categorical_values.items():
            active_features.add(f"{cat}_{val}")

        impacts = []
        for i, (fname, sval) in enumerate(zip(feature_names, shap_vals)):
            if hasattr(sval, '__len__') and not isinstance(sval, str):
                sval = float(sval[0]) if len(sval) > 0 else 0.0
            else:
                sval = float(sval)

            impact_pct = sval * 100

            if abs(impact_pct) < 0.1:
                continue

            fname_lower = fname.lower()
            is_numeric = fname_lower in ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
            is_active_onehot = fname_lower in active_features

            if not is_numeric and not is_active_onehot:
                continue

            impacts.append({
                "raw_feature": fname,
                "shap_value": sval,
                "impact_pct": float(impact_pct)
            })

        impacts_sorted = sorted(impacts, key=lambda x: abs(x["impact_pct"]), reverse=True)

        feature_labels = {
            'duration': ('Call Duration', 'Long call shows strong engagement', 'Short call suggests low interest'),
            'balance': ('Account Balance', 'High balance indicates financial capacity', 'Low balance may limit willingness'),
            'age': ('Customer Age', 'Age profile matches target demographic', 'Age profile less likely to convert'),
            'campaign': ('Campaign Contacts', 'Follow-up helped build interest', 'Too many contacts may have caused fatigue'),
            'pdays': ('Days Since Last Contact', 'Recent engagement keeps interest fresh', 'Too long since last contact'),
            'previous': ('Previous Contacts', 'Prior relationship builds trust', 'Limited prior engagement'),
            'day': ('Contact Day', 'Good timing for financial decisions', 'Timing was suboptimal'),
            'poutcome_success': ('Previous Campaign Success', 'Already showed interest in our products', 'N/A'),
            'poutcome_failure': ('Previous Campaign Rejection', 'N/A', 'Previously declined similar offers'),
            'poutcome_unknown': ('First-Time Contact', 'Fresh prospect with no negative history', 'No prior data to predict behavior'),
            'housing_yes': ('Has Housing Loan', 'Shows trust in financial institutions', 'Existing debt may limit new commitments'),
            'housing_no': ('No Housing Loan', 'More capacity for new products', 'May be less engaged with banking'),
            'loan_yes': ('Has Personal Loan', 'Active banking relationship', 'Existing debt reduces appetite'),
            'loan_no': ('No Personal Loan', 'Lower debt, more flexibility', 'Less active banking relationship'),
            'default_yes': ('Credit Default History', 'N/A', 'Past default indicates financial difficulties'),
            'default_no': ('Clean Credit History', 'Good financial responsibility', 'N/A'),
            'contact_cellular': ('Mobile Contact', 'Personal mobile shows accessibility', 'N/A'),
            'contact_telephone': ('Landline Contact', 'Traditional contact established', 'May be harder to reach'),
            'contact_unknown': ('Unknown Contact Method', 'N/A', 'Missing contact info limits engagement'),
            'job_retired': ('Retired', 'Stable income and time for planning', 'May be more conservative with spending'),
            'job_management': ('Management Role', 'Higher income and decision power', 'May be too busy'),
            'job_technician': ('Technical Professional', 'Stable employment, good income', 'N/A'),
            'job_admin.': ('Administrative Role', 'Regular income', 'Limited disposable income'),
            'job_blue-collar': ('Blue-Collar Work', 'Steady employment', 'Variable income levels'),
            'job_services': ('Services Sector', 'Customer-facing experience', 'Variable income'),
            'job_entrepreneur': ('Entrepreneur', 'Risk-tolerant mindset', 'Variable income may limit commitment'),
            'job_self-employed': ('Self-Employed', 'Independent decision maker', 'Unpredictable income'),
            'job_unemployed': ('Unemployed', 'May be seeking financial solutions', 'Limited financial capacity'),
            'job_student': ('Student', 'Future potential customer', 'Limited current income'),
            'job_housemaid': ('Domestic Worker', 'Steady work', 'Lower income bracket'),
            'marital_married': ('Married', 'Stable household finances', 'Joint decisions may slow process'),
            'marital_single': ('Single', 'Quick individual decisions', 'May have other priorities'),
            'marital_divorced': ('Divorced', 'Independent decision maker', 'May be financially cautious'),
            'education_tertiary': ('University Educated', 'Understands complex products', 'May be more skeptical'),
            'education_secondary': ('High School Education', 'Straightforward communication works', 'May need simpler explanations'),
            'education_primary': ('Primary Education', 'Values simple, clear offers', 'May distrust complex products'),
            'month_jan': ('January Contact', 'New year financial planning mindset', 'Post-holiday financial strain'),
            'month_feb': ('February Contact', 'Quiet month for decisions', 'Low engagement period'),
            'month_mar': ('March Contact', 'Q1 planning still active', 'N/A'),
            'month_apr': ('April Contact', 'Spring financial review', 'Tax concerns may distract'),
            'month_may': ('May Contact', 'Optimistic spring mindset', 'Pre-summer distractions'),
            'month_jun': ('June Contact', 'Mid-year review timing', 'Summer vacation planning'),
            'month_jul': ('July Contact', 'N/A', 'Peak vacation season'),
            'month_aug': ('August Contact', 'N/A', 'Holiday distractions continue'),
            'month_sep': ('September Contact', 'Back-to-business mindset', 'Back-to-school expenses'),
            'month_oct': ('October Contact', 'Year-end planning begins', 'N/A'),
            'month_nov': ('November Contact', 'Year-end financial review', 'Pre-holiday budget concerns'),
            'month_dec': ('December Contact', 'Year-end decisions and bonuses', 'Holiday busyness'),
        }

        top_explanations = []
        for item in impacts_sorted[:5]:
            raw = item['raw_feature'].lower()
            impact = item['impact_pct']

            if raw in feature_labels:
                label_data = feature_labels[raw]
                label = label_data[0]
                context = label_data[1] if impact > 0 else label_data[2]
                if context == 'N/A':
                    context = ""
            else:
                label = item['raw_feature'].replace('_', ' ').title()
                context = ""

            top_explanations.append({
                "feature": label,
                "impact": f"{abs(impact):.1f}%",
                "impact_pct": impact,
                "direction": "positive" if impact > 0 else "negative",
                "context": context,
            })

        all_impacts_simplified = []
        for item in impacts_sorted[:15]:
            raw = item['raw_feature'].lower()
            if raw in feature_labels:
                label = feature_labels[raw][0]
            else:
                label = item['raw_feature'].replace('_', ' ').title()
            all_impacts_simplified.append({
                "feature": label,
                "impact_pct": item['impact_pct']
            })

        print(f"✅ Explain completed for prediction: {prediction:.2%}")

        return jsonify({
            "success": True,
            "prediction": float(prediction),
            "prediction_pct": float(prediction * 100),
            "base_probability": float(base_value * 100),
            "top_explanations": top_explanations,
            "all_impacts": all_impacts_simplified
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
