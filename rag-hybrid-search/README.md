# Aletheia — Backend (rag-hybrid-search)

FastAPI backend powering [Aletheia](https://aletheia-engine.vercel.app), a hybrid RAG search engine with dense + sparse retrieval, citation verification, and confidence scoring.

> For the full project overview, live demo, and features, see the [root README](../README.md).

## 🏗️ Architecture

Documents → Chunking → Local Embeddings → ChromaDB (Dense)
↘                  ↗
BM25 Index (Sparse)
↓
RRF Fusion Layer
↓
Cross-Encoder Reranker (LLM-as-judge)
↓
Grounded Generation (Groq LLaMA-3.3-70b)
↓
Citation Verification + Confidence Score

## 📊 Evaluation Results (recursive / hybrid)

| Metric | Score |
|---|---|
| Avg Correctness | 90.0% |
| Avg Faithfulness | 0.225 |
| Avg Retrieval Relevance | 0.233 |
| Avg Confidence | 0.644 |

## 🛠️ Tech Stack

| Component | Tool |
|---|---|
| Embeddings | Local (`sentence-transformers`, BAAI/bge-small-en-v1.5) |
| Vector Store | ChromaDB |
| Sparse Search | BM25 (rank_bm25) |
| LLM | Groq `llama-3.3-70b-versatile` |
| API | FastAPI |
| Deployment | Render |

## 🚀 Local Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set API keys in .env (see .env.example)
GROQ_API_KEY=your_key
GOOGLE_API_KEY=your_key
TAVILY_API_KEY=your_key

# 3. Add documents to data/raw/, or upload via the running API

# 4. Start the API
python -m app.api.main
```

The API will be available at `http://localhost:8000`.

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/ask` | Ask a question |
| POST | `/v1/ingest` | Index selected documents |
| POST | `/v1/upload` | Upload a new document |
| GET | `/v1/documents` | List a user's documents |
| GET | `/v1/stats` | Per-user index statistics |
| GET | `/v1/stats/global` | Platform-wide statistics |
| GET | `/v1/evaluation/global` | Aggregated evaluation metrics |
| POST | `/v1/web-search` | Web search fallback |
| GET | `/v1/health` | Health check |

## 🔍 Why Hybrid Search?

Dense-only search misses exact keyword matches (function names, error codes, config keys). BM25 sparse search catches those but misses semantic meaning. RRF fusion combines both — consistently outperforms either alone on technical documentation.

## 📁 Project Structure

rag-hybrid-search/
├── app/
│   ├── ingestion/     # Loader, chunker, embedder, vector store, BM25, manifest
│   ├── retrieval/     # Dense, sparse, RRF fusion, reranker
│   ├── generation/    # Prompts, generator, citation verifier, confidence scorer, web search
│   ├── evaluation/    # Golden dataset, metrics, evaluator, query logger
│   └── api/           # FastAPI routes
├── data/
│   ├── raw/           # Uploaded source documents (per-user)
│   ├── processed/     # Cleaned document JSON
│   ├── indexes/       # ChromaDB + BM25 indexes
│   └── eval_results/  # Evaluation run outputs
└── test_*.py          # Standalone test/eval scripts

## ⚠️ Known Limitation

The Render free tier has limited memory and ephemeral disk storage — uploaded documents and indexes are wiped on every redeploy, and heavy ingestion workloads may occasionally exceed the memory limit and trigger a restart.