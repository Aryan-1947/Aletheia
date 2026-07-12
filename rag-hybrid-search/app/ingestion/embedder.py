import numpy as np
from rich.console import Console
from fastembed import TextEmbedding

from app.config import LOCAL_EMBEDDING_MODEL
from app.ingestion.chunker import Chunk

console = Console()

# Lazy-loaded singleton, same pattern as before — model loads on first use,
# not at import time. fastembed runs BAAI/bge-small-en-v1.5 via ONNX Runtime
# instead of PyTorch, which drastically cuts memory usage on low-RAM hosts
# (e.g. Render's free 512MB tier) while keeping embeddings fully local and
# rate-limit-free, same as before.
_model = None


def _get_model():
    global _model
    if _model is None:
        console.print(f"[dim]Loading local embedding model (fastembed/ONNX): {LOCAL_EMBEDDING_MODEL}...[/dim]")
        _model = TextEmbedding(model_name=LOCAL_EMBEDDING_MODEL)
        console.print("[green]✅ Embedding model loaded[/green]")
    return _model


def embed_text(text: str) -> list[float]:
    # fastembed's embed() always returns a generator, even for one input.
    embedding = next(_get_model().embed([text]))
    return embedding.tolist()


def embed_query(query: str) -> list[float]:
    return embed_text(query)


def embed_chunks(chunks: list[Chunk], batch_size: int = 16) -> list[list[float]]:
    console.print(f"\n[bold]Embedding {len(chunks)} chunks locally...[/bold]")
    texts = [c.content for c in chunks]
    embeddings = list(_get_model().embed(texts, batch_size=batch_size))
    console.print(f"[green]✅ Embedded {len(embeddings)} chunks[/green]")
    return [e.tolist() for e in embeddings]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def is_duplicate(
    new_embedding: list[float],
    existing_embeddings: list[list[float]],
    threshold: float = 0.95
) -> bool:
    for existing in existing_embeddings:
        if cosine_similarity(new_embedding, existing) > threshold:
            return True
    return False