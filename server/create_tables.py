# create_tables.py

from app.db.database import engine
from app.db.models import Base

def create_tables():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables dropped and re-created successfully!")

if __name__ == "__main__":
    create_tables()
