import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction  # ✅ Local embeddings
import os

# No need for any API key if using DefaultEmbeddingFunction
embedding_function = DefaultEmbeddingFunction()

# Create ChromaDB client and collection with local embedding model
client = chromadb.Client()
collection = client.get_or_create_collection(
    name="kb_docs",
    embedding_function=embedding_function
)

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