def build_rag_prompt(query: str, chunks: list[dict]) -> str:
    """Build grounded generation prompt with numbered context blocks."""

    context_blocks = ""
    for i, chunk in enumerate(chunks):
        source = chunk.get("metadata", {}).get("filename", chunk.get("source", "unknown"))
        context_blocks += f"\n[{i+1}] Source: {source}\n{chunk['content']}\n"

    return f"""You are a precise question-answering assistant. Answer the question using ONLY the provided context below.

RULES:
1. Cite every claim using bracketed references like [1], [2].
2. If multiple chunks support a claim, cite all of them like [1][2].
3. If the context does not contain enough information, say exactly: "I don't have enough information in the provided documents to answer this."
4. Never use outside knowledge. Only use what's in the context.
5. Be concise and direct.

CONTEXT:
{context_blocks}

QUESTION: {query}

ANSWER (with citations):"""


def build_citation_verify_prompt(claim: str, chunk_content: str) -> str:
    """Prompt to verify if a chunk actually supports a claim."""
    return f"""Does the following passage support the claim? Reply with only YES or NO.

Claim: {claim}

Passage: {chunk_content}

Answer:"""


def build_confidence_prompt(query: str, answer: str, chunks: list[dict]) -> str:
    """Prompt to score answer completeness."""
    context = "\n".join([f"[{i+1}] {c['content'][:300]}" for i, c in enumerate(chunks)])
    return f"""Rate this answer on completeness and groundedness.

Question: {query}
Answer: {answer}
Context used: {context}

Reply with ONLY a JSON object like:
{{"completeness": 8, "groundedness": 9, "reasoning": "one sentence"}}"""