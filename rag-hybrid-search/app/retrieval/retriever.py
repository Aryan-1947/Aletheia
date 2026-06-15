from rich.console import Console
from rich.panel import Panel

from app.retrieval.dense_retriever import dense_retrieve
from app.retrieval.sparse_retriever import sparse_retrieve
from app.retrieval.fusion import reciprocal_rank_fusion
from app.retrieval.reranker import rerank_with_llm
from app.config import TOP_K_DENSE, TOP_K_SPARSE, TOP_K_RERANK

console = Console()


def retrieve(
    query: str,
    top_k_dense: int = TOP_K_DENSE,
    top_k_sparse: int = TOP_K_SPARSE,
    top_k_final: int = TOP_K_RERANK,
    use_reranker: bool = True,
    mode: str = "hybrid",
    collection_name: str = None,
    user_id: str = "default",
) -> dict:
    console.print(Panel(f"[bold cyan]🔍 Retrieving:[/bold cyan] {query[:80]}"))

    if mode in ("hybrid", "dense"):
        console.print("\n[bold]Step 1: Dense retrieval...[/bold]")
        dense_results = dense_retrieve(query, top_k=top_k_dense, collection_name=collection_name)
        console.print(f"  [green]→ {len(dense_results)} dense results[/green]")
    else:
        dense_results = []

    if mode in ("hybrid", "sparse"):
        console.print("\n[bold]Step 2: Sparse (BM25) retrieval...[/bold]")
        sparse_results = sparse_retrieve(query, top_k=top_k_sparse, user_id=user_id)
        console.print(f"  [green]→ {len(sparse_results)} sparse results[/green]")
    else:
        sparse_results = []

    console.print("\n[bold]Step 3: RRF Fusion...[/bold]")
    if mode == "hybrid":
        fused = reciprocal_rank_fusion(dense_results, sparse_results)
    elif mode == "dense":
        fused = dense_results
    else:
        fused = sparse_results
    console.print(f"  [green]→ {len(fused)} fused results[/green]")

    if use_reranker and fused:
        console.print("\n[bold]Step 4: Reranking...[/bold]")
        final_chunks = rerank_with_llm(query, fused, top_k=top_k_final)
    else:
        final_chunks = fused[:top_k_final]

    console.print(f"\n[bold green]✅ Retrieved {len(final_chunks)} final chunks[/bold green]")

    return {
        "query": query,
        "chunks": final_chunks,
        "debug": {
            "dense_count": len(dense_results),
            "sparse_count": len(sparse_results),
            "fused_count": len(fused),
            "final_count": len(final_chunks),
            "mode": mode,
        }
    }