import json
import pickle
import re
from pathlib import Path
from rank_bm25 import BM25Okapi
from rich.console import Console

from app.config import INDEX_DIR

console = Console()


def tokenize(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s_\-\.]', ' ', text)
    return [t for t in text.split() if len(t) > 1]


def build_bm25_index(chunks, index_dir: Path = None) -> BM25Okapi:
    base = index_dir or INDEX_DIR
    bm25_path = base / "bm25_index.pkl"
    chunks_path = base / "bm25_chunks.json"

    tokenized = [tokenize(chunk.content) for chunk in chunks]
    index = BM25Okapi(tokenized)

    base.mkdir(parents=True, exist_ok=True)
    with open(bm25_path, "wb") as f:
        pickle.dump(index, f)

    chunk_data = [
        {
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "doc_id": chunk.doc_id,
            "source": chunk.source,
            "chunk_index": chunk.chunk_index,
            "strategy": chunk.strategy,
            "metadata": chunk.metadata,
        }
        for chunk in chunks
    ]
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(chunk_data, f, indent=2)

    console.print(f"[green]✅ BM25 index built with {len(chunks)} chunks[/green]")
    return index


def load_bm25_index(index_dir: Path = None):
    base = index_dir or INDEX_DIR
    bm25_path = base / "bm25_index.pkl"
    chunks_path = base / "bm25_chunks.json"

    if not bm25_path.exists():
        return None, []

    with open(bm25_path, "rb") as f:
        index = pickle.load(f)
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    return index, chunks


def query_bm25(query: str, top_k: int = 10, index_dir: Path = None) -> list[dict]:
    index, chunks = load_bm25_index(index_dir)

    if index is None or not chunks:
        return []

    tokens = tokenize(query)
    scores = index.get_scores(tokens)
    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:top_k]

    results = []
    for idx, score in ranked:
        if score > 0:
            results.append({
                "chunk_id": chunks[idx]["chunk_id"],
                "content": chunks[idx]["content"],
                "metadata": chunks[idx]["metadata"],
                "score": float(score),
                "source": chunks[idx]["source"],
            })
    return results