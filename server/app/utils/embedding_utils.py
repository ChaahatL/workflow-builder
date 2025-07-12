import cohere
import os

co = cohere.Client(os.getenv("COHERE_API_KEY"))

async def generate_embedding(text: str) -> list[float]:
    if not text.strip():
        return []

    try:
        response = co.embed(
            texts=[text],
            model="embed-english-v3.0",       # same model used for docs
            input_type="search_query"         # 🔑 must be "search_query"
        )
        return response.embeddings[0]
    except Exception as e:
        print("Embedding error (async):", e)
        return []
