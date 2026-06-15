from app.retrieval.retriever import retrieve
from rich.console import Console
from rich import print as rprint

console = Console()

query = "How do I handle errors in FastAPI?"

result = retrieve(query, use_reranker=True, mode="hybrid")

console.print("\n[bold yellow]═══ FINAL RESULTS ═══[/bold yellow]")
for i, chunk in enumerate(result["chunks"]):
    console.print(f"\n[bold]Chunk {i+1}[/bold] | Rerank: {chunk.get('rerank_score')} | RRF: {chunk.get('rrf_score')}")
    console.print(f"[dim]{chunk['content'][:200]}...[/dim]")

rprint("\n[bold]Debug:[/bold]", result["debug"])