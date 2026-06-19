import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
INDEX_DIR = DATA_DIR / "indexes"

# Create dirs if missing
for d in [RAW_DIR, PROCESSED_DIR, INDEX_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Embedding
LOCAL_EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5"
EMBEDDING_DIMENSION = 1024

# Chunking
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# Retrieval
TOP_K_DENSE = 10
TOP_K_SPARSE = 10
TOP_K_RERANK = 5
DENSE_WEIGHT = 0.7
SPARSE_WEIGHT = 0.3

# LLM
GROQ_MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 1024

# ChromaDB
CHROMA_COLLECTION = "rag_documents"