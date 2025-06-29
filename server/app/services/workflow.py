from sqlalchemy.orm import Session
from app.db.models import Workflow
from app.utils.llm_utils import generate_response
from app.db.database import get_db
from uuid import UUID
from sqlalchemy.future import select
from app.db.models import Workflow, Document
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.llm_utils import generate_response
from app.db.schemas import WorkflowCreate, WorkflowUpdate

def create_workflow(db: Session, workflow_data: WorkflowCreate):
    name = workflow_data.name
    data = workflow_data.data

    # Create the workflow — skip ai_summary
    new_workflow = Workflow(
        name=name,
        data=[node.model_dump() for node in workflow_data.data] # Convert to list of dicts
    )

    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)
    return new_workflow

def get_workflow_by_id(db: Session, workflow_id: UUID):
    return db.query(Workflow).filter(Workflow.id == workflow_id).first()

def get_all_workflows(db: Session):
    return db.query(Workflow).all()

def update_workflow(db: Session, workflow_id: UUID, workflow_data: WorkflowUpdate):
    workflow = get_workflow_by_id(db, workflow_id)
    if not workflow:
        return None
    for key, value in workflow_data.dict(exclude_unset=True).items():
        setattr(workflow, key, value)
    db.commit()
    db.refresh(workflow)
    return workflow

def delete_workflow(db: Session, workflow_id: UUID):
    workflow = get_workflow_by_id(db, workflow_id)
    if workflow:
        db.delete(workflow)
        db.commit()
        return True
    return False

async def run_workflow(workflow_id: str, query: str, db: AsyncSession):
    # Fetch workflow from DB
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalars().first()

    if not workflow:
        return {"error": "Workflow not found."}

    # Fetch all documents (simplified — associate later)
    docs_result = await db.execute(select(Document))
    documents = docs_result.scalars().all()

    if not documents:
        return {"error": "No documents found."}

    # Combine all document text
    combined_text = "\n".join([doc.content for doc in documents])
    prompt = f"You are an AI assistant. Based on the document(s) below, answer this query:\n\nQuery: {query}\n\nDocuments:\n{combined_text}"

    response = generate_response(prompt);

    return {
        "workflow_name": workflow.name,
        "response": response
    }

async def save_workflow_and_documents(db: AsyncSession, workflow_data: dict, documents: list):
    # Save workflow
    workflow = Workflow(
        id=str(UUID()),
        name=workflow_data.get("name", "Untitled Workflow"),
        data=workflow_data
    )
    db.add(workflow)

    # Save each document
    for doc in documents:
        document = Document(
            id=str(UUID()),
            name=doc["name"],
            content=doc["content"]
        )
        db.add(document)

    await db.commit()