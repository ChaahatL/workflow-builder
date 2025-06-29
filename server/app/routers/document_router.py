from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import fitz  # PyMuPDF
from app.db.models import Document
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.post("/upload_document")
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs are supported")

    # Extract text from PDF
    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    new_doc = Document(name=file.filename, content=text)

    print("Before add:", new_doc.id)  # Should be None (expected)
    db.add(new_doc)
    await db.commit()     # ✅ Await async commit
    await db.refresh(new_doc)  # ✅ Await async refresh
    print("After commit:", new_doc.id)  # Should now show UUID

    return {"document_id": str(new_doc.id), "name": new_doc.name}