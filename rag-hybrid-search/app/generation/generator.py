import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL, MAX_TOKENS
from app.generation.prompts import build_rag_prompt

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def generate_answer(query: str, chunks: list[dict]) -> dict:
    """Generate a grounded answer with citations from retrieved chunks."""

    if not chunks:
        return {
            "answer": "I don't have enough information in the provided documents to answer this.",
            "chunks_used": 0,
            "citations_found": [],
        }

    prompt = build_rag_prompt(query, chunks)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=MAX_TOKENS,
            temperature=0.1,
        )
        answer = response.choices[0].message.content.strip()

    except Exception as e:
        console.print(f"[red]Generation failed: {e}[/red]")
        return {
            "answer": "Generation failed due to an API error.",
            "chunks_used": len(chunks),
            "citations_found": [],
        }

    # Parse citations from answer
    citations = list(set(re.findall(r'\[(\d+)\]', answer)))
    citations = [int(c) for c in citations if 0 < int(c) <= len(chunks)]

    return {
        "answer": answer,
        "chunks_used": len(chunks),
        "citations_found": sorted(citations),
    }