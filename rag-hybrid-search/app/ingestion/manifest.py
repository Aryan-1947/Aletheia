import json
from pathlib import Path
from app.config import BASE_DIR
from app.utils import sanitize_user_id


def get_manifest_path(user_id: str) -> Path:
    safe_id = sanitize_user_id(user_id)
    manifest_dir = BASE_DIR / "data" / "users" / safe_id
    manifest_dir.mkdir(parents=True, exist_ok=True)
    return manifest_dir / "ingested_files.json"


def get_ingested_files(user_id: str) -> list[str]:
    path = get_manifest_path(user_id)
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def mark_files_ingested(user_id: str, filenames: list[str]):
    path = get_manifest_path(user_id)
    existing = set(get_ingested_files(user_id))
    existing.update(filenames)
    path.write_text(json.dumps(list(existing)), encoding="utf-8")