# app/db/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import UUID

class NodeData(BaseModel):
    label: str
    type: str
    config: Optional[Dict] = {}

class Node(BaseModel):
    id: str
    data: NodeData
    next: List[str]

class WorkflowCreate(BaseModel):
    name: str
    data: List[Node]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[List[Node]] = None

class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    data: List[Node]

    class Config:
        orm_mode = True
