from app.ingestion.embedder import embed_query
from app.ingestion.vector_store import query_vector_store
from app.config import TOP_K_DENSE


def dense_retrieve(query: str, top_k: int = TOP_K_DENSE, collection_name: str = None) -> list[dict]:
    query_embedding = embed_query(query)
    results = query_vector_store(query_embedding, top_k=top_k, collection_name=collection_name)
    for r in results:
        r["retrieval_type"] = "dense"
    return results