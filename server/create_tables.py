# create_tables.py

import asyncio
from app.db.database import engine
from app.db.models import Base

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(create_tables())
    print("✅ Tables created successfully on Render DB!")
