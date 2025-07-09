from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.schemas import WorkflowCreate, WorkflowUpdate
from app.services import workflow as workflow_service
from app.db.database import get_db

router = APIRouter()

@router.post("/create_workflow")
async def create_workflow(workflow_data: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    return await workflow_service.create_workflow(db, workflow_data)

@router.get("/workflows")
async def get_all_workflows(db: AsyncSession = Depends(get_db)):
    return await workflow_service.get_all_workflows(db)

@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: UUID, db: AsyncSession = Depends(get_db)):
    workflow = await workflow_service.get_workflow_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/workflow/{workflow_id}")
async def update_workflow(workflow_id: UUID, workflow_data: WorkflowUpdate, db: AsyncSession = Depends(get_db)):
    updated_wf = await workflow_service.update_workflow(db, workflow_id, workflow_data)
    if not updated_wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return updated_wf

@router.delete("/workflow/{workflow_id}")
async def delete_workflow(workflow_id: UUID, db: AsyncSession = Depends(get_db)):
    deleted = await workflow_service.delete_workflow(db, workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"detail": "Workflow deleted successfully"}