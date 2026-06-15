from pathlib import Path
from rich.console import Console
from rich.panel import Panel

from app.ingestion.document_loader import load_document, load_directory, save_processed
from app.ingestion.chunker import chunk_document, ChunkStrategy
from app.ingestion.embedder import embed_chunks
from app.ingestion.vector_store import add_chunks_to_vector_store, get_collection_stats
from app.ingestion.bm25_index import build_bm25_index
from app.config import PROCESSED_DIR, INDEX_DIR

console = Console()


def ingest_documents(
    source,
    strategy: ChunkStrategy = ChunkStrategy.RECURSIVE,
    rebuild_bm25: bool = True,
    collection_name: str = None,
    user_id: str = "default",
) -> dict:
    console.print(Panel("[bold cyan]🚀 Starting Ingestion Pipeline[/bold cyan]"))
    source = Path(source)

    if source.is_dir():
        docs = load_directory(source)
    else:
        doc = load_document(source)
        docs = [doc] if doc else []

    if not docs:
        return {"status": "failed", "reason": "no documents"}

    for doc in docs:
        save_processed(doc, PROCESSED_DIR)

    all_chunks = []
    for doc in docs:
        chunks = chunk_document(doc, strategy=strategy)
        all_chunks.extend(chunks)

    embeddings = embed_chunks(all_chunks)

    vector_stats = add_chunks_to_vector_store(all_chunks, embeddings, collection_name=collection_name)

    # Per-user BM25 index path
    safe_id = user_id.replace("|", "_").replace("/", "_")
    bm25_dir = INDEX_DIR / "users" / safe_id
    bm25_dir.mkdir(parents=True, exist_ok=True)

    if rebuild_bm25:
        build_bm25_index(all_chunks, index_dir=bm25_dir)

    chroma_stats = get_collection_stats(collection_name)

    console.print(Panel(
        f"[green]✅ Ingestion Complete![/green]\n"
        f"Documents: {len(docs)} | Chunks: {len(all_chunks)}\n"
        f"Added: {vector_stats['added']} | Skipped: {vector_stats['skipped']}",
        title="Summary"
    ))

    return {
        "status": "success",
        "documents": len(docs),
        "chunks": len(all_chunks),
        "vector_stats": vector_stats,
        "chroma_stats": chroma_stats,
    }