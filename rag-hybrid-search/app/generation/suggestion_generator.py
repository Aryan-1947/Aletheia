import json
import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def generate_suggested_questions(sample_chunks: list[str], num_questions: int = 5) -> list[str]:
    """Generate suggested questions based on sample document content."""
    if not sample_chunks:
        return []

    combined = "\n\n".join(sample_chunks[:8])[:3000]  # limit context size

    prompt = f"""You are analyzing a document to suggest questions a user might ask about it.

Document excerpt:
{combined}

Generate {num_questions} diverse, specific questions someone could ask about THIS document's content.
Questions should be short, natural, and directly answerable from the text above.
Do NOT make generic questions — base them on the actual topics, terms, and concepts mentioned.

Reply ONLY with a JSON array of strings, nothing else. Example format:
["Question 1?", "Question 2?", "Question 3?"]"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.4,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'```(?:json)?', '', raw).strip().rstrip('`').strip()
        questions = json.loads(raw)
        return [q for q in questions if isinstance(q, str)][:num_questions]
    except Exception as e:
        console.print(f"[yellow]Suggestion generation failed: {e}[/yellow]")
        return []