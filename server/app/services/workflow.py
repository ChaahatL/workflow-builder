from sqlalchemy.orm import Session
from app.db.models import Workflow
from uuid import uuid4, UUID
from sqlalchemy.future import select
from app.db.models import Workflow, Document
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import WorkflowCreate, WorkflowUpdate
from typing import List, Dict, Any
from fastapi import UploadFile
from app.utils.llm_utils import generate_response
from app.utils.pdf_utils import extract_text_and_embedding
from app.utils.embedding_utils import generate_embedding  # You’ll create this
import numpy as np
from app.services.vectorstore import add_to_vector_store, query_vector_store

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
    
    # Step 2.5: Generate query embedding
    query_embedding = await generate_embedding(query)

    # Step 2.6: Semantic Search - compute cosine similarity
    def cosine_similarity(a, b):
        a = np.array(a)
        b = np.array(b)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    top_docs = []
    for doc in documents:
        if doc.embedding:
            similarity = cosine_similarity(query_embedding, doc.embedding)
            top_docs.append((similarity, doc.content))

    # Step 2.7: Get top 1–3 most relevant documents
    top_docs.sort(reverse=True)
    context = "\n".join([doc for _, doc in top_docs[:3]])

    # Step 3: Inject user query into TextInput node
    for node in nodes:
        if node.get("type") == "UserQuery":
            node["data"] = node.get("data", {})
            node["data"]["prompt"] = query  # Inject chat input

        elif node.get("type") == "KnowledgeBase":
            node["data"] = node.get("data", {})
            node["data"]["value"] = context  # Inject relevant doc content

    # Step 4: Run actual execution logic
    result = await execute_workflow(nodes, edges, files)

    return result  # Should be { "result": "...LLM output..." }

async def save_workflow_and_documents(db: AsyncSession, workflow_data: dict, documents: list):
    # Save workflow
    workflow = Workflow(
        id=uuid4(),
        name=workflow_data.get("name", "Untitled Workflow"),
        description=workflow_data.get("description", ""),
        nodes=workflow_data.get("nodes", []),
        edges=workflow_data.get("edges", [])
    )
    db.add(workflow)

    # Save each document
    for doc in documents:
        text, embedding = await extract_text_and_embedding(doc["content"])
        add_to_vector_store(doc["name"], text)  # ✅ inside loop

        document = Document(
            id=uuid4(),
            name=doc["name"],
            content=text,
            embedding=embedding,
        )
        db.add(document)

    await db.commit()
    # return {"message": "Workflow and documents saved successfully", "workflow_id": str(workflow.id)}
    return {"id": str(workflow.id)}

async def execute_workflow(nodes: List[Dict[str, Any]], edges: List[Dict[str, str]], files: Dict[str, UploadFile]):
    node_outputs = {}
    node_lookup = {node['id']: node for node in nodes}

    for node in nodes:
        node_id = node['id']
        node_type = node['type']
        config = node.get('data', {})

        if node_type == 'DocumentInput':
            file = files.get(node_id)
            if file:
                text, _ = await extract_text_and_embedding(file)
                node_outputs[node_id] = text
            else:
                node_outputs[node_id] = ''

        elif node_type == 'UserQuery':
            prompt = config.get('prompt', '')
            print(f"🧠 UserQuery prompt: {prompt}")
            node_outputs[node_id] = prompt

        elif node_type == 'KnowledgeBase':
            # 1️⃣ pull the user query from the upstream node
            input_text = ''
            for edge in edges:
                if edge['target'] == node_id:
                    input_text = node_outputs.get(edge['source'], '')
                    break

            print(f"📚 KnowledgeBase received input: {input_text}")

            # 2️⃣ vector search → list[str]
            context_chunks = query_vector_store(input_text)        # returns ["The capital of Germany is Berlin", ...]
            kb_output = "\n".join(context_chunks)                  # join chunks

            node_outputs[node_id] = kb_output                      # ✅ keep this!
            # 🔸 DO NOT overwrite it with input_text

        elif 'LLM' in node_type:
            input_text = ''
            for edge in edges:
                if edge['target'] == node_id:
                    input_text = node_outputs.get(edge['source'], '')
                    print(f"🔄 LLM input from node {edge['source']} → {repr(input_text)}")
                    break

            # 💡 Pull the original user query
            user_query = ''
            for node in nodes:
                if node['type'] == 'UserQuery':
                    user_query = node_outputs.get(node['id'], '')
                    break

            # 🧠 New default prompt template (uses both context and query)
            prompt_template = config.get('promptTemplate') or \
                "Use the following context to answer the question below.\n\nContext:\n{input}\n\nQuestion:\n{query}"

            # 🏗️ Replace both placeholders
            prompt = prompt_template.replace('{input}', input_text).replace('{query}', user_query)

            print("📨 Prompt sent to LLM Model:", prompt)
            print("🧩 input_text from previous nodes:", input_text)
            print("🧩 user_query:", user_query)
            print("🧩 Final prompt:", prompt)

            if not prompt.strip():
                print("⚠️ Skipping LLM due to empty prompt.")
                node_outputs[node_id] = "⚠️ No input provided to LLM node."
                continue

            temperature = float(config.get("temperature", 0.7))
            response = await generate_response(prompt, temperature)

            print("📬 LLM response:", response)
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