def sanitize_user_id(user_id: str) -> str:
    """Convert an Auth0 user ID (e.g. 'google-oauth2|12345') into a
    filesystem/collection-name-safe string. Single source of truth —
    previously this exact logic was duplicated across routes.py,
    manifest.py, sparse_retriever.py, and pipeline.py."""
    return user_id.replace("|", "_").replace("/", "_")