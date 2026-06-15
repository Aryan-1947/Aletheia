from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from app.retrieval.retriever import retrieve
from app.generation.generator import generate_answer
from app.generation.citation_verifier import verify_citations
from app.generation.confidence_scorer import score_answer_confidence

console = Console()


def ask(
    query: str,
    mode: str = "hybrid",
    use_reranker: bool = True,
    verify: bool = True,
    collection_name: str = None,
    user_id: str = "default",
) -> dict:
    console.print(Panel(f"[bold magenta]❓ Question:[/bold magenta] {query}"))

    retrieval = retrieve(
        query, mode=mode, use_reranker=use_reranker,
        collection_name=collection_name, user_id=user_id
    )
    chunks = retrieval["chunks"]

    if not chunks:
        return {
            "query": query,
            "answer": "I don't have enough information in the provided documents to answer this.",
            "citations": [],
            "confidence": {"composite": 0.0, "grade": "LOW"},
            "sources": [],
            "debug": retrieval["debug"],
        }

    console.print("\n[bold]Generating answer...[/bold]")
    generation = generate_answer(query, chunks)
    answer = generation["answer"]
    console.print(f"\n[bold yellow]Answer:[/bold yellow] {answer}\n")

    if verify and generation["citations_found"]:
        console.print("[bold]Verifying citations...[/bold]")
        verification = verify_citations(answer, chunks)
    else:
        verification = {"verified": [], "support_rate": 1.0, "unsupported_claims": []}

    console.print("[bold]Scoring confidence...[/bold]")
    confidence = score_answer_confidence(
        query, answer, chunks,
        citation_support_rate=verification["support_rate"]
    )

    sources = []
    for i, chunk in enumerate(chunks):
        sources.append({
            "index": i + 1,
            "filename": chunk.get("metadata", {}).get("filename", "unknown"),
            "source": chunk.get("source", ""),
            "rerank_score": chunk.get("rerank_score"),
            "preview": chunk["content"][:150] + "...",
        })

    table = Table(title="Confidence Scores", show_header=True)
    table.add_column("Metric", style="cyan")
    table.add_column("Score", style="green")
    table.add_row("Composite", f"{confidence['composite']} ({confidence['grade']})")
    table.add_row("Retrieval", str(confidence["retrieval_confidence"]))
    table.add_row("Citation Support", str(confidence["citation_support_rate"]))
    table.add_row("Completeness", f"{confidence['completeness']}/10")
    table.add_row("Groundedness", f"{confidence['groundedness']}/10")
    console.print(table)

    return {
        "query": query,
        "answer": answer,
        "citations": verification["verified"],
        "confidence": confidence,
        "sources": sources,
        "debug": retrieval["debug"],
    }