import numpy as np
from rich.console import Console
from sentence_transformers import SentenceTransformer

from app.config import LOCAL_EMBEDDING_MODEL
from app.ingestion.chunker import Chunk

console = Console()

# Lazy-loaded singleton — the model is only loaded into memory on first actual
# use, not at import time. This avoids loading ~130MB+ of model weights during
# app startup, which can exceed low-memory environments (e.g. Render free tier)
# and cause the process to be killed before it ever binds to a port.
_model = None


def _get_model():
    global _model
    if _model is None:
        console.print(f"[dim]Loading local embedding model: {LOCAL_EMBEDDING_MODEL}...[/dim]")
        _model = SentenceTransformer(LOCAL_EMBEDDING_MODEL)
        console.print("[green]✅ Embedding model loaded[/green]")
    return _model


def embed_text(text: str) -> list[float]:
    embedding = _get_model().encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_query(query: str) -> list[float]:
    return embed_text(query)


def embed_chunks(chunks: list[Chunk], batch_size: int = 32) -> list[list[float]]:
    console.print(f"\n[bold]Embedding {len(chunks)} chunks locally...[/bold]")
    texts = [c.content for c in chunks]
    embeddings = _get_model().encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=True,
        normalize_embeddings=True,
    )
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







'''import time
import numpy as np
import google.generativeai as genai
from rich.console import Console
from tqdm import tqdm

from app.config import GOOGLE_API_KEY, EMBEDDING_MODEL
from app.ingestion.chunker import Chunk

console = Console()
genai.configure(api_key=GOOGLE_API_KEY)


def embed_text(text: str, task_type: str = "retrieval_document") -> list[float]:
    """Embed a single text string."""
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type=task_type
    )
    return result["embedding"]


def embed_query(query: str) -> list[float]:
    """Embed a user query (different task type for better retrieval)."""
    return embed_text(query, task_type="retrieval_query")


def embed_chunks(chunks: list[Chunk], batch_size: int = 20) -> list[list[float]]:
    """Embed all chunks with progress bar and rate limit handling."""
    embeddings = []
    console.print(f"\n[bold]Embedding {len(chunks)} chunks...[/bold]")

    for i, chunk in enumerate(tqdm(chunks, desc="Embedding")):
        try:
            emb = embed_text(chunk.content)
            embeddings.append(emb)

            # Rate limit: small delay every batch
            if (i + 1) % batch_size == 0:
                time.sleep(3)

        except Exception as e:
            console.print(f"[red]Embedding failed for chunk {i}: {e}[/red]")
            # Use zero vector as fallback
            embeddings.append([0.0] * 768)

    console.print(f"[green]✅ Embedded {len(embeddings)} chunks[/green]")
    return embeddings


def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def is_duplicate(
    new_embedding: list[float],
    existing_embeddings: list[list[float]],
    threshold: float = 0.95
) -> bool:
    """Check if new chunk is near-duplicate of any existing chunk."""
    for existing in existing_embeddings:
        if cosine_similarity(new_embedding, existing) > threshold:
            return True
    return False'''