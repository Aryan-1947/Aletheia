from pathlib import Path
from app.ingestion.bm25_index import query_bm25
from app.config import TOP_K_SPARSE, INDEX_DIR
from app.utils import sanitize_user_id


def sparse_retrieve(query: str, top_k: int = TOP_K_SPARSE, user_id: str = "default") -> list[dict]:
    safe_id = sanitize_user_id(user_id)
    index_dir = INDEX_DIR / "users" / safe_id
    results = query_bm25(query, top_k=top_k, index_dir=index_dir)
    for r in results:
        r["retrieval_type"] = "sparse"
    return results