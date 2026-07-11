from pathlib import Path
from rich.console import Console
from rich.panel import Panel

from app.ingestion.document_loader import load_document, load_directory, save_processed
from app.ingestion.chunker import chunk_document, ChunkStrategy
from app.ingestion.embedder import embed_chunks
from app.ingestion.vector_store import add_chunks_to_vector_store, get_collection_stats
from app.ingestion.bm25_index import build_bm25_index, load_bm25_index
from app.config import PROCESSED_DIR, INDEX_DIR

console = Console()


def ingest_documents(
    source,
    strategy: ChunkStrategy = ChunkStrategy.RECURSIVE,
    rebuild_bm25: bool = True,
    collection_name: str = None,
    user_id: str = "default",
    selected_files: list[str] = None,
) -> dict:
    console.print(Panel("[bold cyan]🚀 Starting Ingestion Pipeline[/bold cyan]"))
    source = Path(source)

    if source.is_dir():
        docs = load_directory(source)
        if selected_files:
            docs = [d for d in docs if Path(d.source).name in selected_files]
    else:
        doc = load_document(source)
        docs = [doc] if doc else []

    if not docs:
        return {"status": "failed", "reason": "no documents selected"}

    for doc in docs:
        save_processed(doc, PROCESSED_DIR)

    all_chunks = []
    for doc in docs:
        chunks = chunk_document(doc, strategy=strategy)
        all_chunks.extend(chunks)

    embeddings = embed_chunks(all_chunks)

    vector_stats = add_chunks_to_vector_store(all_chunks, embeddings, collection_name=collection_name)

    # Per-user BM25 index path
    from app.utils import sanitize_user_id
    safe_id = sanitize_user_id(user_id)
    bm25_dir = INDEX_DIR / "users" / safe_id
    bm25_dir.mkdir(parents=True, exist_ok=True)

    if rebuild_bm25:
        # Merge new chunks with existing BM25 chunks (don't overwrite old docs)
        _, existing_chunks_data = load_bm25_index(bm25_dir)

        existing_ids = {c["chunk_id"] for c in existing_chunks_data} if existing_chunks_data else set()
        new_chunks_only = [c for c in all_chunks if c.chunk_id not in existing_ids]

        if existing_chunks_data:
            # Rebuild combined chunk objects list for BM25
            from app.ingestion.chunker import Chunk
            combined_chunks = []
            for c in existing_chunks_data:
                combined_chunks.append(Chunk(
                    content=c["content"], doc_id=c["doc_id"], source=c["source"],
                    chunk_index=c["chunk_index"], strategy=c["strategy"], metadata=c["metadata"]
                ))
            combined_chunks.extend(new_chunks_only)
            build_bm25_index(combined_chunks, index_dir=bm25_dir)
        else:
            build_bm25_index(all_chunks, index_dir=bm25_dir)

    chroma_stats = get_collection_stats(collection_name)

    console.print(Panel(
        f"[green]✅ Ingestion Complete![/green]\n"
        f"Documents: {len(docs)} | Chunks: {len(all_chunks)}\n"
        f"Added: {vector_stats['added']} | Skipped: {vector_stats['skipped']}",
        title="Summary"
    ))

    # Generate suggested questions from sample chunks
    from app.generation.suggestion_generator import generate_suggested_questions
    import json as json_lib
    from app.config import BASE_DIR

    sample_texts = [c.content for c in all_chunks[:10]]
    suggestions = generate_suggested_questions(sample_texts)

    suggestions_dir = BASE_DIR / "data" / "users" / safe_id
    suggestions_dir.mkdir(parents=True, exist_ok=True)
    suggestions_path = suggestions_dir / "suggestions.json"
    suggestions_path.write_text(json_lib.dumps(suggestions), encoding="utf-8")

    # Mark these files as ingested
    from app.ingestion.manifest import mark_files_ingested
    filenames = [Path(d.source).name for d in docs]
    mark_files_ingested(user_id, filenames)

    return {
        "status": "success",
        "documents": len(docs),
        "chunks": len(all_chunks),
        "vector_stats": vector_stats,
        "chroma_stats": chroma_stats,
    }