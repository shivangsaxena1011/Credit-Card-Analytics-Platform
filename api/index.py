import sys
from pathlib import Path

# Ensure root and backend directories are in sys.path for Vercel Python runtime
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

for d in (str(ROOT_DIR), str(BACKEND_DIR), str(BASE_DIR)):
    if d not in sys.path:
        sys.path.insert(0, d)

from backend.main import app
