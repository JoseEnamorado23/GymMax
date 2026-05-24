import sys
import os
import secrets
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.usuario import Usuario
from app.models.plan import Plan

def main():
    db = SessionLocal()
    try:
        usuarios = db.query(Usuario).filter(Usuario.token_app == None).all()
        count = 0
        for user in usuarios:
            user.token_app = secrets.token_urlsafe(16)
            count += 1
        db.commit()
        print(f"Tokens assigned to {count} users.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
