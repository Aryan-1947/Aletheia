from app.config import DENSE_WEIGHT, SPARSE_WEIGHT


def reciprocal_rank_fusion(
    dense_results: list[dict],
    sparse_results: list[dict],
    dense_weight: float = DENSE_WEIGHT,
    sparse_weight: float = SPARSE_WEIGHT,
    k: int = 60,
) -> list[dict]:
    """
    Combine dense + sparse results using Reciprocal Rank Fusion.
    RRF score = sum(weight / (k + rank)) across lists.
    """
    scores: dict[str, float] = {}
    all_chunks: dict[str, dict] = {}

    # Score dense results
    for rank, chunk in enumerate(dense_results):
        cid = chunk["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + dense_weight / (k + rank + 1)
        all_chunks[cid] = chunk

    # Score sparse results
    for rank, chunk in enumerate(sparse_results):
        cid = chunk["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + sparse_weight / (k + rank + 1)
        if cid not in all_chunks:
            all_chunks[cid] = chunk

    # Sort by fused score
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    fused = []
    for cid, score in ranked:
        chunk = all_chunks[cid].copy()
        chunk["rrf_score"] = round(score, 6)
        chunk["retrieval_type"] = "hybrid"
        fused.append(chunk)

    return fused