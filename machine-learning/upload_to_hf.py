import os
from huggingface_hub import HfApi, create_repo

REPO_ID = input("Enter your Hugging Face Repo ID (e.g., username/model-name): ").strip()
TOKEN = os.getenv("HF_TOKEN") or input("Enter your Hugging Face Write Token: ").strip()

FILES_TO_UPLOAD = [
    "machine-learning/model/BEST_MODEL.pkl",
    "machine-learning/model/scaler.pkl",
    "machine-learning/model/onehot_encoder.pkl"
]

def upload_models():
    api = HfApi(token=TOKEN)
    print(f"Checking/Creating repository: {REPO_ID}...")
    try:
        create_repo(repo_id=REPO_ID, repo_type="model", token=TOKEN, exist_ok=True)
    except Exception as e:
        print(f"Error creating repo: {e}")
        return

    print("Starting upload...")
    for file_path in FILES_TO_UPLOAD:
        if os.path.exists(file_path):
            file_name = os.path.basename(file_path)
            print(f"Uploading {file_name}...")
            api.upload_file(
                path_or_fileobj=file_path,
                path_in_repo=file_name,
                repo_id=REPO_ID,
                repo_type="model"
            )
        else:
            print(f"⚠️ Warning: File not found locally: {file_path}")

    print("\n✅ Upload complete! You can now use this repo in your app.")

if __name__ == "__main__":
    upload_models()
