# server/app/routers/workflow_execution_router.py

from fastapi import Depends, APIRouter, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.services.workflow import run_workflow
from app.db.database import get_db

router = APIRouter()

@router.post("/execute_workflow/{workflow_id}")
async def execute_saved_workflow(workflow_id: UUID, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        payload = await request.json()
        query = payload.get("query")

        if not query:
            raise HTTPException(status_code=400, detail="Query is required.")

        response = await run_workflow(workflow_id, query, db)
        print("🔧 Running workflow...")
        return {"output": response}

    except Exception as e:
        print(f"❌ Error in /execute_workflow/{workflow_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")