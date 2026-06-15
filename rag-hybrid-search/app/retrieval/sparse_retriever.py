from pathlib import Path
from app.ingestion.bm25_index import query_bm25
from app.config import TOP_K_SPARSE, INDEX_DIR


def sparse_retrieve(query: str, top_k: int = TOP_K_SPARSE, user_id: str = "default") -> list[dict]:
    safe_id = user_id.replace("|", "_").replace("/", "_")
    index_dir = INDEX_DIR / "users" / safe_id
    results = query_bm25(query, top_k=top_k, index_dir=index_dir)
    for r in results:
        r["retrieval_type"] = "sparse"
    return results