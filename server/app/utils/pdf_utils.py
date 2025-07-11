import fitz  # PyMuPDF
from app.utils.embedding_utils import generate_embedding  # ensure async-safe
import asyncio

async def extract_text_and_embedding(pdf_bytes: bytes) -> tuple[str, list[float]]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    embedding = await generate_embedding(text)
    return text, embedding
