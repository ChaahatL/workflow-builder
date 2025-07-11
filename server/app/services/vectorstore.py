import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import os

openai_api_key = os.getenv("OPENAI_API_KEY")
embedding_function = OpenAIEmbeddingFunction(api_key=openai_api_key)

client = chromadb.Client()
collection = client.get_or_create_collection(name="kb_docs", embedding_function=embedding_function)

def add_to_vector_store(doc_id: str, content: str):
    collection.add(
        documents=[content],
        ids=[doc_id],
    )
    print(f"✅ Added doc to vector store: {doc_id}")

def query_vector_store(query: str, top_k=3):
    result = collection.query(
        query_texts=[query],
        n_results=top_k
    )
    print("🔍 Vector store matches:", result)
    return result["documents"][0] if result["documents"] else []