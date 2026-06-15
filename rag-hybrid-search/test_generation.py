from app.generation.rag_pipeline import ask

result = ask(
    "How do I handle errors in FastAPI?",
    mode="hybrid",
    use_reranker=True,
    verify=True,
)

print("\n=== FINAL RESULT ===")
print(f"Answer: {result['answer']}")
print(f"Confidence: {result['confidence']['composite']} ({result['confidence']['grade']})")
print(f"Sources used: {[s['filename'] for s in result['sources']]}")