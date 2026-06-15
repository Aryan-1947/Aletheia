import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def score_keyword_match(answer: str, expected_keywords: list[str]) -> float:
    """Check what fraction of expected keywords appear in answer."""
    if not expected_keywords:
        return 1.0
    answer_lower = answer.lower()
    matched = sum(1 for kw in expected_keywords if kw.lower() in answer_lower)
    return round(matched / len(expected_keywords), 3)


def score_correctness_llm(
    question: str,
    answer: str,
    expected_keywords: list[str],
    question_type: str,
) -> dict:
    """Use LLM-as-judge to score answer correctness."""

    if question_type == "no_answer":
        # Should say "I don't have enough information"
        refused = "don't have enough information" in answer.lower() or "not" in answer.lower()
        return {
            "correct": refused,
            "score": 1.0 if refused else 0.0,
            "reasoning": "Correctly refused" if refused else "Should have refused — answer not in corpus",
        }

    prompt = f"""You are evaluating a question-answering system.

Question: {question}
Expected keywords that should appear: {expected_keywords}
System's answer: {answer}

Rate the answer:
1. Does it correctly answer the question? (yes/no)
2. Score 0.0 to 1.0 for correctness

Reply ONLY with JSON: {{"correct": true/false, "score": 0.0-1.0, "reasoning": "one sentence"}}"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0,
        )
        import json
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'```(?:json)?', '', raw).strip().rstrip('`').strip()
        return json.loads(raw)
    except Exception as e:
        console.print(f"  [yellow]LLM judge error: {e}[/yellow]")
        return {"correct": False, "score": 0.5, "reasoning": "Evaluation error"}


def score_faithfulness(answer: str, chunks: list[dict]) -> float:
    """Check if answer content is grounded in retrieved chunks."""
    if not chunks or not answer:
        return 0.0

    combined_context = " ".join([c["content"] for c in chunks]).lower()
    sentences = re.split(r'(?<=[.!?])\s+', answer.strip())
    grounded = 0

    for sentence in sentences:
        clean = re.sub(r'\[\d+\]', '', sentence).strip().lower()
        if len(clean) < 10:
            continue
        # Check if key words from sentence appear in context
        words = [w for w in clean.split() if len(w) > 4]
        if not words:
            continue
        matches = sum(1 for w in words if w in combined_context)
        if matches / len(words) > 0.5:
            grounded += 1

    total = len([s for s in sentences if len(re.sub(r'\[\d+\]', '', s).strip()) > 10])
    return round(grounded / total, 3) if total > 0 else 1.0


def score_retrieval_relevance(question: str, chunks: list[dict], expected_keywords: list[str]) -> float:
    """Check if retrieved chunks contain expected keywords."""
    if not chunks or not expected_keywords:
        return 1.0
    combined = " ".join([c["content"] for c in chunks]).lower()
    matched = sum(1 for kw in expected_keywords if kw.lower() in combined)
    return round(matched / len(expected_keywords), 3)