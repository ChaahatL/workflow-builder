# app/db/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Node(BaseModel):
    id: str
    type: str
    config: Dict[str, Any]
    next: List[str]

class WorkflowCreate(BaseModel):
    name: str
    description: str
    nodes: list[dict]
    edges: list[dict]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[List[Node]] = None

class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    data: List[Node]

    class Config:
        orm_mode = True
