import os

DATA_DIR = os.environ.get("SEEDANCE_DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
DB_PATH = os.path.join(DATA_DIR, "seedance.db")
ENCRYPTION_KEY_FILE = os.path.join(DATA_DIR, ".encryption_key")

# Ensure data dir exists
os.makedirs(DATA_DIR, exist_ok=True)

# CORS: allow frontend dev server
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5210,http://127.0.0.1:5173,http://127.0.0.1:5210").split(",")
