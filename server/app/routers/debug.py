# in app/routers/debug.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from sqlalchemy import text

router = APIRouter()

@router.get("/check-columns")
async def check_columns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'documents';
    """))
    return [row[0] for row in result.fetchall()]