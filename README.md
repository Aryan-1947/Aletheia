# 🔍 RAGSearch — Production-grade RAG Pipeline with Hybrid Search

> Ask anything about your documents. Get grounded answers with verified citations and confidence scores.

**Live Demo:** [ragsearch-fullstack.vercel.app](https://ragsearch-fullstack.vercel.app)

---

## 🧠 What is this?

RAGSearch lets you upload any document (PDF, Markdown, HTML, TXT) and ask natural language questions about it. Answers are grounded strictly in your documents with inline citations — no hallucinations, no outside knowledge.

Each user gets their own private document space (Google/GitHub OAuth).

---

## ✨ Features

- **Hybrid Search** — Dense vector search (ChromaDB) + BM25 sparse search combined via Reciprocal Rank Fusion
- **Cross-Encoder Reranking** — Top candidates reranked for maximum precision
- **Citation Verification** — Every claim verified against source chunks using LLM-as-judge
- **Confidence Scoring** — Composite score across retrieval, faithfulness, and completeness
- **3 Chunking Strategies** — Fixed, Recursive (recommended), Semantic
- **Per-user Isolation** — Google/GitHub OAuth, each user's docs are private
- **Dark/Light Mode** — Because we care

---

## 📊 Evaluation Results

| Metric | Score |
|---|---|
| Answer Correctness | 100% |
| Citation Support Rate | 1.0 |
| Avg Confidence Score | 0.80 |
| Avg Faithfulness | 0.567 |

Tested on a 10-question golden Q&A dataset (recursive chunking / hybrid mode).

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| LLM | Groq LLaMA-3.3-70b |
| Embeddings | Google Gemini (gemini-embedding-001) |
| Vector Store | ChromaDB |
| Sparse Search | BM25 (rank-bm25) |
| Reranker | LLM-as-judge (Groq) |
| Backend | FastAPI + Python 3.11 |
| Frontend | React + Vite + Tailwind |
| Auth | Auth0 (Google + GitHub OAuth) |
| Deployment | Railway (backend) + Vercel (frontend) |
| Chunking | LangChain Text Splitters |

---

## 🚀 How to Use (Live)

1. Go to [ragsearch-fullstack.vercel.app](https://ragsearch-fullstack.vercel.app)
2. Login with Google or GitHub
3. Go to **Documents** → upload your PDF/MD/TXT file
4. Select **recursive** chunking → click **Run Ingestion**
5. Go to **Ask** → type your question
6. Get grounded answers with verified citations 🎉

> ⚠️ **Note:** Use **recursive** chunking. Semantic chunking is rate-limited on Google AI Studio's free tier (gemini-embedding-001 allows 100 req/min — semantic chunking embeds every sentence individually and hits this fast on large docs).

---
