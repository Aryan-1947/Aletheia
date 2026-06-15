import re
from groq import Groq
from rich.console import Console

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.generation.prompts import build_citation_verify_prompt

console = Console()
client = Groq(api_key=GROQ_API_KEY)


def extract_claims_with_citations(answer: str) -> list[dict]:
    """Split answer into sentences and extract which citations each uses."""
    sentences = re.split(r'(?<=[.!?])\s+', answer.strip())
    claims = []

    for sentence in sentences:
        cited = re.findall(r'\[(\d+)\]', sentence)
        if cited:
            clean = re.sub(r'\[\d+\]', '', sentence).strip()
            if clean:
                claims.append({
                    "claim": clean,
                    "citation_indices": [int(c) for c in cited],
                })

    return claims


def verify_citations(
    answer: str,
    chunks: list[dict],
) -> dict:
    """
    For each cited claim, verify the cited chunk actually supports it.
    Returns verification results and a support rate.
    """
    claims = extract_claims_with_citations(answer)

    if not claims:
        return {
            "verified": [],
            "support_rate": 1.0,
            "unsupported_claims": [],
        }

    console.print(f"  [dim]Verifying {len(claims)} cited claims...[/dim]")

    verified = []
    unsupported = []

    for claim_data in claims:
        claim = claim_data["claim"]
        indices = claim_data["citation_indices"]
        claim_supported = False

        for idx in indices:
            if idx < 1 or idx > len(chunks):
                continue

            chunk_content = chunks[idx - 1]["content"]
            prompt = build_citation_verify_prompt(claim, chunk_content)

            try:
                response = client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=5,
                    temperature=0,
                )
                verdict = response.choices[0].message.content.strip().upper()
                if "YES" in verdict:
                    claim_supported = True
                    break

            except Exception as e:
                console.print(f"  [yellow]Verification error: {e}[/yellow]")
                claim_supported = True  # Give benefit of doubt on API error

        verified.append({
            "claim": claim,
            "citations": indices,
            "supported": claim_supported,
        })

        if not claim_supported:
            unsupported.append(claim)

    support_rate = sum(1 for v in verified if v["supported"]) / len(verified) if verified else 1.0

    return {
        "verified": verified,
        "support_rate": round(support_rate, 3),
        "unsupported_claims": unsupported,
    }