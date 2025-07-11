from app.utils import openai_client  # Ensures key is set
import openai

async def generate_embedding(text: str) -> list[float]:
    if not text.strip():
        return []

    try:
        response = await openai.Embedding.acreate(
            model="text-embedding-3-small",
            input=text,
        )
        return response["data"][0]["embedding"]
    except Exception as e:
        print("Embedding error:", e)
        return []