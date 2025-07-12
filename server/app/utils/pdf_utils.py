import fitz  # PyMuPDF
import base64
import cohere
import os

co = cohere.Client(os.getenv("COHERE_API_KEY"))

async def extract_text_and_embedding(pdf_base64_str: str):
    try:
        pdf_bytes = base64.b64decode(pdf_base64_str)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        try:
            # ✅ Attempt real embedding
            response = co.embed(
                texts=[text],
                model="embed-english-v3.0",
                input_type="search_document",
            )
            embedding = response.embeddings[0]
        except Exception as embed_error:
            print("⚠️ Cohere embedding failed:", embed_error)
            # ✅ Fallback: dummy embedding
            embedding = [0.0] * 768

        return text, embedding

    except Exception as e:
        raise RuntimeError(f"Failed to extract PDF: {e}")