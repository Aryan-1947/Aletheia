from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil

from app.generation.rag_pipeline import ask
from app.ingestion.pipeline import ingest_documents
from app.ingestion.vector_store import get_collection_stats
from app.ingestion.chunker import ChunkStrategy
from app.config import BASE_DIR

app = FastAPI(
    title="RAG Hybrid Search API",
    description="Production-grade RAG pipeline with hybrid retrieval",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_user_raw_dir(user_id: str) -> Path:
    safe_id = user_id.replace("|", "_").replace("/", "_")
    user_dir = BASE_DIR / "data" / "users" / safe_id / "raw"
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def get_user_collection(user_id: str) -> str:
    safe_id = user_id.replace("|", "_").replace("/", "_")
    return f"rag_{safe_id}"


class AskRequest(BaseModel):
    question: str
    mode: str = "hybrid"
    use_reranker: bool = True
    verify_citations: bool = True
    user_id: str = "default"


class AskResponse(BaseModel):
    question: str
    answer: str
    confidence: dict
    sources: list
    citations: list
    debug: dict


class IngestRequest(BaseModel):
    strategy: str = "recursive"
    user_id: str = "default"


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "RAGSearch API running 🚀"}


@app.get("/v1/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.post("/v1/ask", response_model=AskResponse, tags=["RAG"])
def ask_question(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    collection = get_user_collection(req.user_id)
    result = ask(
        query=req.question,
        mode=req.mode,
        use_reranker=req.use_reranker,
        verify=req.verify_citations,
        collection_name=collection,
        user_id=req.user_id,
    )
    result["question"] = result.pop("query")
    return AskResponse(**result)


@app.post("/v1/ingest", tags=["Ingestion"])
def ingest(req: IngestRequest):
    strategy_map = {
        "fixed": ChunkStrategy.FIXED,
        "recursive": ChunkStrategy.RECURSIVE,
        "semantic": ChunkStrategy.SEMANTIC,
    }
    strategy = strategy_map.get(req.strategy, ChunkStrategy.RECURSIVE)
    user_dir = get_user_raw_dir(req.user_id)
    collection = get_user_collection(req.user_id)
    result = ingest_documents(
        user_dir,
        strategy=strategy,
        collection_name=collection,
        user_id=req.user_id
    )
    return result


@app.post("/v1/upload", tags=["Ingestion"])
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(default="default")
):
    allowed = {".txt", ".md", ".html", ".htm", ".pdf"}
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

    user_dir = get_user_raw_dir(user_id)
    dest = user_dir / file.filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"status": "uploaded", "filename": file.filename}


@app.get("/v1/documents", tags=["Ingestion"])
def list_documents(user_id: str = Query(default="default")):
    allowed = {".txt", ".md", ".html", ".htm", ".pdf"}
    user_dir = get_user_raw_dir(user_id)
    files = [
        {
            "filename": f.name,
            "size_kb": round(f.stat().st_size / 1024, 2),
            "type": f.suffix.lstrip(".")
        }
        for f in user_dir.rglob("*") if f.suffix.lower() in allowed
    ]
    collection = get_user_collection(user_id)
    stats = get_collection_stats(collection)
    return {"documents": files, "total_chunks_indexed": stats["total_chunks"]}


@app.get("/v1/stats", tags=["Stats"])
def stats(user_id: str = Query(default="default")):
    collection = get_user_collection(user_id)
    return get_collection_stats(collection)