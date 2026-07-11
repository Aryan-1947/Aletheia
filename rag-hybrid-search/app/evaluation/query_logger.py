import json
import time
from pathlib import Path
from datetime import datetime
from threading import Lock

from app.config import BASE_DIR

LOG_DIR = BASE_DIR / "data" / "query_logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
GLOBAL_LOG = LOG_DIR / "global_log.jsonl"
_lock = Lock()


def log_query(
    user_id: str,
    question: str,
    answer: str,
    confidence: dict,
    citation_support_rate: float,
    response_time_sec: float,
):
    """Append a query result to the global log file (JSONL format)."""
    entry = {
        "user_id": user_id,
        "question": question,
        "answer": answer[:300],
        "correctness_proxy": 1.0 if confidence.get("composite", 0) > 0 else 0.0,
        "faithfulness": citation_support_rate,
        "retrieval_confidence": confidence.get("retrieval_confidence", 0),
        "confidence_composite": confidence.get("composite", 0),
        "grade": confidence.get("grade", "LOW"),
        "response_time_sec": round(response_time_sec, 2),
        "timestamp": datetime.now().isoformat(),
    }

    with _lock:
        with open(GLOBAL_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")

    return entry


def get_global_stats() -> dict:
    """Aggregate stats across ALL users."""
    if not GLOBAL_LOG.exists():
        return {
            "total_queries": 0,
            "avg_correctness": 0,
            "avg_citation_support": 0,
            "avg_confidence": 0,
            "avg_faithfulness": 0,
        }

    entries = []
    with open(GLOBAL_LOG, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                entries.append(json.loads(line))

    if not entries:
        return {
            "total_queries": 0,
            "avg_correctness": 0,
            "avg_citation_support": 0,
            "avg_confidence": 0,
            "avg_faithfulness": 0,
        }

    n = len(entries)
    return {
        "total_queries": n,
        "avg_correctness": round(sum(e["correctness_proxy"] for e in entries) / n, 3),
        "avg_citation_support": round(sum(e["faithfulness"] for e in entries) / n, 3),
        "avg_confidence": round(sum(e["confidence_composite"] for e in entries) / n, 3),
        "avg_faithfulness": round(sum(e["faithfulness"] for e in entries) / n, 3),
    }


def get_user_history(user_id: str, limit: int = 50) -> list[dict]:
    """Get a specific user's query history, most recent first."""
    if not GLOBAL_LOG.exists():
        return []

    entries = []
    with open(GLOBAL_LOG, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                entry = json.loads(line)
                if entry["user_id"] == user_id:
                    entries.append(entry)

    entries.reverse()  # most recent first
    return entries[:limit]


def delete_query_entry(user_id: str, timestamp: str):
    """Remove a single query entry (matched by user_id + exact timestamp)
    by rewriting the log file without it. No true 'undo' exists for an
    append-only log, so this requires a confirm step on the frontend."""
    if not GLOBAL_LOG.exists():
        return False

    with _lock:
        entries = []
        with open(GLOBAL_LOG, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))

        remaining = [
            e for e in entries
            if not (e["user_id"] == user_id and e["timestamp"] == timestamp)
        ]

        if len(remaining) == len(entries):
            return False  # nothing matched, nothing deleted

        with open(GLOBAL_LOG, "w", encoding="utf-8") as f:
            for e in remaining:
                f.write(json.dumps(e) + "\n")

        return True