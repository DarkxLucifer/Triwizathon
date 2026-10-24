import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.services.seed_service import seed_database

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, force=True)
        print("Seeder executed successfully!")
    finally:
        db.close()
