# RAG Pipeline with Hybrid Search

A production-grade Retrieval-Augmented Generation system with hybrid dense + sparse retrieval, citation verification, and confidence scoring.

## 🏗️ Architecture

Documents → Chunking → Embeddings → ChromaDB (Dense)
                    ↘             ↗
                      BM25 Index (Sparse)
                           ↓
                    RRF Fusion Layer
                           ↓
                    Cross-Encoder Reranker
                           ↓
              Grounded Generation (Groq LLaMA-3.3-70b)
                           ↓
                  Citation Verification + Confidence Score



## 📊 Evaluation Results (recursive / hybrid)

| Metric | Score |
|---|---|
| Correctness | 100% |
| Avg Faithfulness | 0.567 |
| Avg Confidence | 0.805 |
| Citation Support | 1.0 |

## 🛠️ Tech Stack

| Component | Tool |
|---|---|
| Embeddings | Google `gemini-embedding-001` |
| Vector Store | ChromaDB |
| Sparse Search | BM25 (rank_bm25) |
| LLM | Groq `llama-3.3-70b-versatile` |
| API | FastAPI |
| Dashboard | Streamlit |

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set API keys in .env
GROQ_API_KEY=your_key
GOOGLE_API_KEY=your_key

# 3. Add documents to data/raw/

# 4. Index documents
python test_ingestion.py

# 5. Start API (Terminal 1)
python -m app.api.main

# 6. Start Dashboard (Terminal 2)
streamlit run app/dashboard/ui.py
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/v1/ask` | Ask a question |
| POST | `/v1/ingest` | Re-index documents |
| POST | `/v1/upload` | Upload a new document |
| GET | `/v1/documents` | List indexed documents |
| GET | `/v1/stats` | Index statistics |
| GET | `/v1/health` | Health check |

## 🔍 Why Hybrid Search?

Dense-only search misses exact keyword matches (function names, error codes, config keys).
BM25 sparse search catches those but misses semantic meaning.
RRF fusion combines both — consistently outperforms either alone on technical documentation.

## 📁 Project Structure



rag-hybrid-search/
├── app/
│   ├── ingestion/     # Loader, chunker, embedder, vector store, BM25
│   ├── retrieval/     # Dense, sparse, RRF fusion, reranker
│   ├── generation/    # Prompts, generator, citation verifier, scorer
│   ├── evaluation/    # Golden dataset, metrics, evaluator
│   ├── api/           # FastAPI routes
│   └── dashboard/     # Streamlit UI
├── data/
│   ├── raw/           # Source documents
│   ├── processed/     # Cleaned JSON
│   ├── indexes/       # ChromaDB + BM25
│   └── eval_results/  # Evaluation JSONs
└── tests/