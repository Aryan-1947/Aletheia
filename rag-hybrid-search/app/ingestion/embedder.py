import time
import requests
import numpy as np
from rich.console import Console

from app.config import LOCAL_EMBEDDING_MODEL, HF_API_TOKEN
from app.ingestion.chunker import Chunk

console = Console()

HF_URL = f"https://router.huggingface.co/hf-inference/models/{LOCAL_EMBEDDING_MODEL}/pipeline/feature-extraction"


def _call_hf(texts: list[str], max_retries: int = 5) -> list[list[float]]:
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": texts, "options": {"wait_for_model": True}}

    for attempt in range(max_retries):
        resp = requests.post(HF_URL, headers=headers, json=payload, timeout=60)

        if resp.status_code == 200:
            data = resp.json()
            return data

        if resp.status_code in (429, 503):
            wait = min(2 ** attempt, 30)
            console.print(f"[yellow]HF rate-limited/loading (status {resp.status_code}), retrying in {wait}s...[/yellow]")
            time.sleep(wait)
            continue

        raise RuntimeError(f"HF embedding request failed: {resp.status_code} {resp.text[:200]}")

    raise RuntimeError("HF embedding failed after max retries — rate limit likely exhausted for this hour.")


def embed_text(text: str) -> list[float]:
    result = _call_hf([text])
    return result[0]


def embed_query(query: str) -> list[float]:
    return embed_text(query)


def embed_chunks(chunks: list[Chunk], batch_size: int = 20) -> list[list[float]]:
    console.print(f"\n[bold]Embedding {len(chunks)} chunks via Hugging Face Inference API...[/bold]")
    texts = [c.content for c in chunks]
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        embeddings = _call_hf(batch)
        all_embeddings.extend(embeddings)
        console.print(f"  [dim]{min(i + batch_size, len(texts))}/{len(texts)} embedded[/dim]")

    console.print(f"[green]✅ Embedded {len(all_embeddings)} chunks[/green]")
    return all_embeddings


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