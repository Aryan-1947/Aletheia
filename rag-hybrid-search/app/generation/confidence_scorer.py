import json
import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.generation.prompts import build_confidence_prompt

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def score_retrieval_confidence(chunks: list[dict]) -> float:
    """Average rerank scores normalized to 0-1."""
    if not chunks:
        return 0.0
    scores = [c.get("rerank_score", 5) for c in chunks]
    return round(sum(scores) / (len(scores) * 10), 3)


def score_answer_confidence(
    query: str,
    answer: str,
    chunks: list[dict],
    citation_support_rate: float,
) -> dict:
    """Composite confidence score across 3 dimensions."""

    retrieval_conf = score_retrieval_confidence(chunks)

    # Ask LLM for completeness + groundedness
    prompt = build_confidence_prompt(query, answer, chunks)
    completeness, groundedness = 7, 7  # defaults

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        raw = re.sub(r'```(?:json)?', '', raw).strip().rstrip('`').strip()
        data = json.loads(raw)
        completeness = int(data.get("completeness", 7))
        groundedness = int(data.get("groundedness", 7))
        reasoning = data.get("reasoning", "")

    except Exception as e:
        console.print(f"  [yellow]Confidence scoring error: {e}[/yellow]")
        reasoning = "Scoring unavailable"

    composite = round(
        (retrieval_conf * 0.3) +
        (citation_support_rate * 0.4) +
        (completeness / 10 * 0.15) +
        (groundedness / 10 * 0.15),
        3
    )

    return {
        "composite": composite,
        "retrieval_confidence": retrieval_conf,
        "citation_support_rate": citation_support_rate,
        "completeness": completeness,
        "groundedness": groundedness,
        "reasoning": reasoning,
        "grade": "HIGH" if composite >= 0.75 else "MEDIUM" if composite >= 0.5 else "LOW",
    }