from sqlalchemy.orm import Session
from app.db.models import Workflow
from uuid import UUID
from sqlalchemy.future import select
from app.db.models import Workflow, Document
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import WorkflowCreate, WorkflowUpdate
from typing import List, Dict, Any
from fastapi import UploadFile
from app.utils.llm_utils import generate_response
from app.utils.pdf_utils import extract_text_from_pdf

async def create_workflow(db: Session, workflow_data: WorkflowCreate):
    # ✅ Correct usage — directly access fields from Pydantic model
    workflow = Workflow(
        name=workflow_data.name,
        description=workflow_data.description,
        nodes=workflow_data.nodes,
        edges=workflow_data.edges,
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    print("🛠️ Incoming workflow data:", workflow_data.dict())
    return workflow

async def get_workflow_by_id(db: AsyncSession, workflow_id: UUID):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    return result.scalar_one_or_none()

async def get_all_workflows(db: AsyncSession):
    result = await db.execute(select(Workflow))
    return result.scalars().all()

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

async def run_workflow(workflow_id: str, query: str, db):
    # Step 1: Get the workflow from DB
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    if not workflow:
        return {"error": "Workflow not found."}

    try:
        nodes = workflow.nodes
        edges = workflow.edges
    except Exception as e:
        return {"error": f"Invalid workflow data: {str(e)}"}

    # Step 2: Fetch documents from DB
    docs_result = await db.execute(select(Document))
    documents = docs_result.scalars().all()

    files = {}
    for doc in documents:
        # Optional: Map documents to a node ID if available (doc.node_id)
        node_id = getattr(doc, "node_id", "document_fallback")
        files[node_id] = doc.content.encode("utf-8")  # assuming .content is text

    # Step 3: Inject user query into TextInput node
    for node in nodes:
        if node.get("type") == "UserQuery":
            node["data"] = node.get("data", {})
            node["data"]["prompt"] = query  # Inject chat input

    # Step 4: Run actual execution logic
    result = await execute_workflow(nodes, edges, files)

    return result  # Should be { "result": "...LLM output..." }

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

async def execute_workflow(nodes: List[Dict[str, Any]], edges: List[Dict[str, str]], files: Dict[str, UploadFile]):
    node_outputs = {}
    node_lookup = {node['id']: node for node in nodes}

    for node in nodes:
        node_id = node['id']
        node_type = node['type']
        config = node.get('data', {})

        if node_type == 'UserQuery':
            node_outputs[node_id] = config.get('prompt', '')

        elif node_type == 'DocumentInput':
            file = files.get(node_id)
            if file:
                text = await extract_text_from_pdf(file)
                node_outputs[node_id] = text
            else:
                node_outputs[node_id] = ''

        elif node_type == 'UserQuery':
            prompt = config.get('prompt', '')
            print(f"🧠 UserQuery prompt: {prompt}")
            node_outputs[node_id] = prompt

        elif node_type == 'KnowledgeBase':
            input_text = ''
            for edge in edges:
                if edge['target'] == node_id:
                    input_text = node_outputs.get(edge['source'], '')
                    break
            print(f"📚 KnowledgeBase received input: {input_text}")
            node_outputs[node_id] = input_text  # replace with search logic later

        elif 'LLM' in node_type:
            input_text = ''
            for edge in edges:
                if edge['target'] == node_id:
                    input_text = node_outputs.get(edge['source'], '')
                    break
            prompt_template = config.get('promptTemplate') or '{input}'
            prompt = prompt_template.replace('{input}', input_text)
            print("📨 Prompt sent to Gemini:", prompt)
            print("🧩 input_text from previous node:", input_text)
            print("🧩 prompt_template:", prompt_template)
            print("📨 Final prompt:", prompt)

            if not prompt.strip():
                print("⚠️ Skipping LLM due to empty prompt.")
                node_outputs[node_id] = "⚠️ No input provided to LLM node."
                continue

            response = generate_response(prompt)
            print("📬 Gemini response:", response)
            node_outputs[node_id] = response

        elif node_type == 'Output':
            output_text = ''
            for edge in edges:
                if edge['target'] == node_id:
                    output_text = node_outputs.get(edge['source'], '')
                    break
            node_outputs[node_id] = output_text

    final_output = ''
    for node in nodes:
        if node['type'] == 'Output':
            final_output = node_outputs.get(node['id'], '')
            break

    return {"result": final_output}
