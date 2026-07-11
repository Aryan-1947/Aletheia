import logging
import chromadb
from chromadb.config import Settings
from rich.console import Console

from app.config import INDEX_DIR, CHROMA_COLLECTION
from app.ingestion.chunker import Chunk
from app.ingestion.embedder import is_duplicate

logging.getLogger("chromadb").setLevel(logging.ERROR)
console = Console()


def get_chroma_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(
        path=str(INDEX_DIR / "chroma"),
        settings=Settings(anonymized_telemetry=False, allow_reset=True)
    )


def get_or_create_collection(client, collection_name: str = None):
    name = collection_name or CHROMA_COLLECTION
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )


def add_chunks_to_vector_store(chunks, embeddings, collection_name: str = None) -> dict:
    client = get_chroma_client()
    collection = get_or_create_collection(client, collection_name)

    existing = collection.get(include=["embeddings"])
    existing_embeddings = existing["embeddings"] or []

    added, skipped = 0, 0
    ids, docs, metas, embeds = [], [], [], []

    for chunk, emb in zip(chunks, embeddings):
        if is_duplicate(emb, existing_embeddings):
            skipped += 1
            continue
        ids.append(chunk.chunk_id)
        docs.append(chunk.content)
        metas.append({
            "doc_id": chunk.doc_id,
            "source": chunk.source,
            "chunk_index": chunk.chunk_index,
            "strategy": chunk.strategy,
            **{k: str(v) for k, v in chunk.metadata.items()}
        })
        embeds.append(emb)
        existing_embeddings.append(emb)
        added += 1

    if ids:
        collection.add(ids=ids, documents=docs, metadatas=metas, embeddings=embeds)

    console.print(f"[green]✅ Vector store: {added} added, {skipped} duplicates skipped[/green]")
    return {"added": added, "skipped": skipped}


def query_vector_store(query_embedding, top_k: int = 10, collection_name: str = None) -> list[dict]:
    client = get_chroma_client()
    collection = get_or_create_collection(client, collection_name)

    count = collection.count()
    if count == 0:
        return []

    actual_k = min(top_k, count)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=actual_k,
        include=["documents", "metadatas", "distances"]
    )

    hits = []
    for i in range(len(results["ids"][0])):
        hits.append({
            "chunk_id": results["ids"][0][i],
            "content": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score": 1 - results["distances"][0][i],
        })
    return hits


def get_collection_stats(collection_name: str = None) -> dict:
    client = get_chroma_client()
    collection = get_or_create_collection(client, collection_name)
    return {"total_chunks": collection.count(), "collection": collection_name or CHROMA_COLLECTION}



def get_platform_stats() -> dict:
    """Aggregate real stats across every user's collection — used by the
    Landing page to show genuine platform-wide numbers instead of hardcoded
    placeholders."""
    client = get_chroma_client()
    collections = client.list_collections()

    total_chunks = 0
    user_collection_count = 0
    for col in collections:
        name = col.name if hasattr(col, "name") else col
        if isinstance(name, str) and name.startswith("rag_"):
            try:
                c = client.get_collection(name)
                count = c.count()
                if count > 0:
                    total_chunks += count
                    user_collection_count += 1
            except Exception:
                continue

    return {
        "total_chunks": total_chunks,
        "active_users": user_collection_count,
    }    