import streamlit as st
import requests

API_URL = "http://localhost:8000"

st.set_page_config(
    page_title="RAG Hybrid Search",
    page_icon="🔍",
    layout="wide",
)

# ── Sidebar ────────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("⚙️ Settings")

    mode = st.selectbox(
        "Retrieval Mode",
        ["hybrid", "dense", "sparse"],
        index=0,
        help="hybrid = dense + sparse fused. Best for production."
    )

    use_reranker = st.toggle("Use Reranker", value=True,
        help="Cross-encoder reranker for higher precision")

    verify_citations = st.toggle("Verify Citations", value=True,
        help="LLM-as-judge checks each citation")

    st.divider()
    st.subheader("📁 Upload Document")
    uploaded = st.file_uploader(
        "Upload .md, .txt, .pdf, .html",
        type=["md", "txt", "pdf", "html"]
    )
    if uploaded and st.button("Upload & Ingest"):
        with st.spinner("Uploading..."):
            files = {"file": (uploaded.name, uploaded.getvalue())}
            r = requests.post(f"{API_URL}/v1/upload", files=files)
            if r.status_code == 200:
                st.success(f"✅ Uploaded: {uploaded.name}")
                r2 = requests.post(f"{API_URL}/v1/ingest", json={"strategy": "recursive"})
                if r2.status_code == 200:
                    st.success("✅ Ingested into index!")
                else:
                    st.error("Ingestion failed")
            else:
                st.error(f"Upload failed: {r.text}")

    st.divider()
    st.subheader("📊 Index Stats")
    try:
        stats = requests.get(f"{API_URL}/v1/stats", timeout=3).json()
        st.metric("Indexed Chunks", stats["total_chunks"])
    except:
        st.warning("API not reachable")

    st.divider()
    st.subheader("📄 Indexed Documents")
    try:
        docs = requests.get(f"{API_URL}/v1/documents", timeout=3).json()
        for d in docs["documents"]:
            st.caption(f"📄 {d['filename']} ({d['size_kb']} KB)")
    except:
        st.caption("No documents found")


# ── Main UI ────────────────────────────────────────────────────────────────
st.title("🔍 RAG Hybrid Search")
st.caption("Ask questions grounded in your internal documents")

query = st.text_input(
    "Ask a question:",
    placeholder="e.g. How do I handle errors in FastAPI?",
)

col1, col2 = st.columns([1, 5])
with col1:
    submit = st.button("Ask", type="primary", use_container_width=True)
with col2:
    compare = st.button("Compare: Hybrid vs Dense-only", use_container_width=True)


# ── Single Query ───────────────────────────────────────────────────────────
if submit and query:
    with st.spinner("Thinking..."):
        try:
            resp = requests.post(f"{API_URL}/v1/ask", json={
                "question": query,
                "mode": mode,
                "use_reranker": use_reranker,
                "verify_citations": verify_citations,
            }, timeout=60)
            data = resp.json()
        except Exception as e:
            st.error(f"API error: {e}")
            st.stop()

    # Answer
    st.subheader("💬 Answer")
    grade = data["confidence"]["grade"]
    color = {"HIGH": "🟢", "MEDIUM": "🟡", "LOW": "🔴"}.get(grade, "⚪")
    st.info(data["answer"])

    # Confidence
    st.subheader("📊 Confidence")
    conf = data["confidence"]
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Composite", f"{conf['composite']} {color}")
    c2.metric("Retrieval", conf["retrieval_confidence"])
    c3.metric("Citation Support", conf["citation_support_rate"])
    c4.metric("Groundedness", f"{conf['groundedness']}/10")

    # Citations
    if data["citations"]:
        st.subheader("🔖 Citation Verification")
        for c in data["citations"]:
            supported = c.get("supported", True)
            icon = "✅" if supported else "❌"
            with st.expander(f"{icon} Claim: {c['claim'][:80]}..."):
                st.write(f"**Cited:** {c['citations']}")
                st.write(f"**Supported:** {supported}")

    # Sources
    st.subheader("📚 Source Chunks")
    for s in data["sources"]:
        with st.expander(f"[{s['index']}] {s['filename']} — Rerank score: {s.get('rerank_score', 'N/A')}"):
            st.caption(s["preview"])

    # Debug
    with st.expander("🛠️ Debug Info"):
        st.json(data["debug"])


# ── Comparison Mode ────────────────────────────────────────────────────────
if compare and query:
    st.subheader("⚖️ Hybrid vs Dense-only Comparison")
    col_h, col_d = st.columns(2)

    with st.spinner("Running both modes..."):
        hybrid_resp = requests.post(f"{API_URL}/v1/ask", json={
            "question": query, "mode": "hybrid",
            "use_reranker": use_reranker, "verify_citations": False,
        }, timeout=60)
        dense_resp = requests.post(f"{API_URL}/v1/ask", json={
            "question": query, "mode": "dense",
            "use_reranker": use_reranker, "verify_citations": False,
        }, timeout=60)

    h = hybrid_resp.json()
    d = dense_resp.json()

    with col_h:
        st.markdown("### 🔀 Hybrid")
        st.info(h["answer"])
        st.metric("Confidence", h["confidence"]["composite"])
        st.metric("Grade", h["confidence"]["grade"])

    with col_d:
        st.markdown("### 🧲 Dense Only")
        st.info(d["answer"])
        st.metric("Confidence", d["confidence"]["composite"])
        st.metric("Grade", d["confidence"]["grade"])