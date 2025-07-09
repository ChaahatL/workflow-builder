from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import create_engine
from app.db.models import Base
from app.db.database import DATABASE_URL  # import your DB URL from your config

def create_tables():
    # Create a sync engine from the same DB URL
    sync_engine = create_engine(DATABASE_URL.replace("postgresql+asyncpg", "postgresql"))
    
    Base.metadata.drop_all(bind=sync_engine)
    Base.metadata.create_all(bind=sync_engine)
    print("✅ Tables dropped and re-created successfully!")

if __name__ == "__main__":
    create_tables()
