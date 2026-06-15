from app.ingestion.pipeline import ingest_documents
from app.ingestion.chunker import ChunkStrategy

result = ingest_documents("data/raw", strategy=ChunkStrategy.RECURSIVE)
print(result)