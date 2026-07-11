import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL, MAX_TOKENS
from app.generation.prompts import build_strict_prompt, build_balanced_prompt

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def generate_answer(query: str, chunks: list[dict], mode: str = "strict") -> dict:
    """Generate answer with strictness mode control."""

    if not chunks:
        return {
            "answer": "I cannot find this in your uploaded documents.",
            "chunks_used": 0,
            "citations_found": [],
            "strictness_mode": mode,
        }

    temperature = 0.1 if mode == "strict" else 0.5
    prompt = build_strict_prompt(query, chunks) if mode == "strict" else build_balanced_prompt(query, chunks)

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=MAX_TOKENS,
            temperature=temperature,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        console.print(f"[red]Generation failed: {e}[/red]")
        return {
            "answer": "Generation failed due to an API error.",
            "chunks_used": len(chunks),
            "citations_found": [],
            "strictness_mode": mode,
        }

    citations = list(set(re.findall(r'\[(\d+)\]', answer)))
    citations = [int(c) for c in citations if 0 < int(c) <= len(chunks)]

    return {
        "answer": answer,
        "chunks_used": len(chunks),
        "citations_found": sorted(citations),
        "strictness_mode": mode,
    }