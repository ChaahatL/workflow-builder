# app/db/models.py
from sqlalchemy import Column, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base  # important!

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    data = Column(JSON, nullable=False)

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    content = Column(Text, nullable=False)