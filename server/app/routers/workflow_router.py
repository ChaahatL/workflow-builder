# app/routers/workflow_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.schemas import WorkflowCreate, WorkflowUpdate
from app.services import workflow as workflow_service
from app.db.database import get_db
from uuid import UUID

router = APIRouter()

@router.post("/create_workflow")
def create_workflow(workflow_data: WorkflowCreate, db: Session = Depends(get_db)):
    return workflow_service.create_workflow(db, workflow_data)

@router.get("/workflows")
def get_all_workflows(db: Session = Depends(get_db)):
    return workflow_service.get_all_workflows(db)

@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: UUID, db: Session = Depends(get_db)):
    workflow = workflow_service.get_workflow_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/workflow/{workflow_id}")
def update_workflow(workflow_id: UUID, workflow_data: WorkflowUpdate, db: Session = Depends(get_db)):
    updated_wf = workflow_service.update_workflow(db, workflow_id, workflow_data)
    if not updated_wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return updated_wf

@router.delete("/workflow/{workflow_id}")
def delete_workflow(workflow_id: UUID, db: Session = Depends(get_db)):
    deleted = workflow_service.delete_workflow(db, workflow_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"detail": "Workflow deleted successfully"}
