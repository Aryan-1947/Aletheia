import os
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL, TOP_K_RERANK

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def rerank_with_llm(query: str, chunks: list[dict], top_k: int = TOP_K_RERANK) -> list[dict]:
    """
    Use LLM-as-judge to rerank top candidates.
    Scores each chunk's relevance to the query on 1-10 scale.
    """
    if not chunks:
        return []

    # Only rerank top 20 for efficiency
    candidates = chunks[:20]
    console.print(f"  [dim]Reranking {len(candidates)} candidates → keeping top {top_k}...[/dim]")

    scored = []
    for chunk in candidates:
        try:
            prompt = f"""Rate how relevant this text passage is for answering the question.

Question: {query}

Passage: {chunk['content'][:600]}

Reply with ONLY a single integer score from 1 to 10.
10 = perfectly answers the question
1 = completely irrelevant

Score:"""

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=5,
                temperature=0,
            )

            raw = response.choices[0].message.content.strip()
            score = int(''.join(filter(str.isdigit, raw)) or "1")
            score = max(1, min(10, score))

        except Exception as e:
            console.print(f"  [yellow]Rerank failed for chunk, defaulting score 5: {e}[/yellow]")
            score = 5

        scored.append({**chunk, "rerank_score": score})

    # Sort by rerank score, break ties with rrf_score
    scored.sort(key=lambda x: (x["rerank_score"], x.get("rrf_score", 0)), reverse=True)

    result = scored[:top_k]
    console.print(f"  [green]→ Top {len(result)} chunks selected (scores: {[c['rerank_score'] for c in result]})[/green]")
    return result