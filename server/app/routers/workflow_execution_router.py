# server/app/routers/workflow_execution_router.py

from fastapi import Depends, APIRouter, Request, HTTPException
from app.services.workflow import run_workflow
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/execute_workflow/{workflow_id}")
async def execute_workflow(workflow_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.json()
    query = payload.get("query")

    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")

    response = await run_workflow(workflow_id, query, db)
    return response
