# Aletheia — Hybrid RAG Search Engine

> Ask anything about your documents. Get grounded, cited, confidence-scored answers — not hallucinations.

**Live Demo:** [aletheia-engine.vercel.app](https://aletheia-engine.vercel.app)

---

## 🧠 What is Aletheia?

Aletheia is a production-grade Retrieval-Augmented Generation (RAG) platform. Upload any document — a PDF, a research paper, internal notes, markdown, or HTML — and ask it questions in plain English. Instead of guessing or hallucinating, Aletheia retrieves the exact passages relevant to your question, verifies that its answer is actually supported by those passages, and shows you precisely which source chunks backed every claim.

Think of it as a private, document-aware assistant that **shows its work** — every answer comes with inline citations, a confidence score, and the exact source text it drew from, so you can trust (and check) what it tells you.

Each user gets a fully private, isolated document space (Google/GitHub login) — nobody else can see or query your uploaded files.

---

## ✨ What it can do

### Hybrid Retrieval
Combines two different search strategies and fuses them for better accuracy than either alone:
- **Dense retrieval** — semantic vector search (via ChromaDB) that understands *meaning*, not just keywords
- **Sparse retrieval** — BM25 keyword search that catches exact terms, codes, and names dense search can miss
- **Reciprocal Rank Fusion (RRF)** — merges both result sets into one ranked list

### Cross-Encoder Reranking
The top candidates from retrieval are re-scored by an LLM acting as a relevance judge, pushing the truly best-matching chunks to the top before generation — not just "close enough" matches.

### Two Grounding Modes
- **Strict** — the model answers *only* from your documents. If it's not in there, it says so honestly ("I cannot find this in your uploaded documents") instead of making something up.
- **Balanced** — the model uses your documents as the primary source but can supplement with general knowledge to explain unclear concepts, clearly labeled ("Generally speaking...") so you always know what's document-grounded vs. not.

### Citation Verification
Every claim the model makes gets independently checked against its cited source chunk by a second LLM pass — judging the actual *meaning*, not just matching words — so citations mean something, not just decoration.

### Confidence Scoring
Every answer gets a composite score (HIGH / MEDIUM / LOW) built from four signals: retrieval quality, citation support rate, completeness, and groundedness — so you can tell at a glance how much to trust a given answer.

### Web Search Fallback
When your documents don't have the answer, Aletheia can search the live web — using your original question *and* its own document-grounded findings as context, so the web search is actually relevant, not generic.

### 3 Chunking Strategies
- **Fixed** — simple, fast, evenly-sized chunks
- **Recursive** (recommended) — splits on natural paragraph/sentence boundaries
- **Semantic** — groups text by topic similarity for the most coherent chunks, at the cost of more processing time

### Built for Real Use
- Drag-and-drop uploads with automatic duplicate-file handling (never silently overwrites)
- Live, real platform-wide stats on the landing page (not fake placeholder numbers)
- Full query history and evaluation dashboard per user
- Dark/light mode, fully responsive

---

## 🏗️ How it works, end to end

```
Your Question
      │
      ▼
┌─────────────────────────────────────────┐
│ 1. Hybrid Retrieval                     │
│    Dense (vector) + Sparse (BM25)       │
│    → fused via Reciprocal Rank Fusion   │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ 2. Cross-Encoder Reranking              │
│    LLM re-scores candidates 1-10        │
│    → top 5 most relevant kept           │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ 3. Grounded Generation                  │
│    Strict or Balanced mode              │
│    → cited answer produced              │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ 4. Citation Verification                │
│    Each claim checked against its       │
│    cited source chunk for real support  │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ 5. Confidence Scoring                   │
│    Retrieval + Citations + Completeness │
│    + Groundedness → one composite score │
└─────────────────────────────────────────┘
      │
      ▼
Your Answer — cited, scored, and verified
```

---

## 📊 Evaluation Results

Tested on a 10-question golden Q&A dataset (recursive chunking, hybrid retrieval mode).

| Metric | Score |
|---|---|
| Avg Correctness | 90.0% |
| Avg Faithfulness | 0.225 |
| Avg Retrieval Relevance | 0.233 |
| Avg Confidence | 0.644 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq (`openai/gpt-oss-120b`) |
| Embeddings | Hugging Face Inference API (`sentence-transformers/all-MiniLM-L6-v2`) |
| Vector Store | ChromaDB |
| Sparse Search | BM25 (`rank-bm25`) |
| Reranker | LLM-as-judge (Groq) |
| Backend | FastAPI + Python 3.11 |
| Frontend | React + Vite + Tailwind CSS |
| Auth | Auth0 (Google + GitHub OAuth) |
| Deployment | Render (backend) + Vercel (frontend) |
| Chunking | LangChain Text Splitters |

---

## 🚀 How to Use (Live)

1. Go to [aletheia-engine.vercel.app](https://aletheia-engine.vercel.app)
2. Log in with Google or GitHub
3. **Documents** → upload a PDF/MD/TXT/HTML file (drag-and-drop supported)
4. Pick a chunking strategy (recursive recommended) → **Run Ingestion**
5. **Ask** → type your question, pick Strict or Balanced grounding
6. Read your answer, check the cited sources, see the confidence score

> ⚠️ **Note:** The backend runs on a free-tier instance that spins down after inactivity — the first request after idle time may take up to ~50 seconds to wake up.

---

## 📁 Project Structure

This is a monorepo with two independently deployed halves:

```
├── rag-hybrid-search/   FastAPI backend — see its own README for architecture details
└── rag-frontend/        React frontend — see its own README for local setup
```

---

## 🙋 Why I built this

Document-grounded Q&A systems are everywhere now, but most either hallucinate confidently or hide how they arrived at an answer. Aletheia was built to make the retrieval and reasoning process transparent — every answer shows its sources, every citation is independently checked, and every response carries an honest confidence score instead of false certainty.