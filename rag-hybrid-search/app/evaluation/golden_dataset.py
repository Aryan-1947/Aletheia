# Golden Q&A dataset — ground truth for evaluation
# Each entry: question, expected answer keywords, source doc, question type

GOLDEN_QA = [
    {
        "id": "q1",
        "question": "How do I install FastAPI?",
        "expected_keywords": ["pip", "fastapi", "uvicorn"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q2",
        "question": "How does FastAPI handle validation errors?",
        "expected_keywords": ["422", "validation", "automatically"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q3",
        "question": "What is generated automatically at /docs?",
        "expected_keywords": ["openapi", "documentation"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q4",
        "question": "How do I validate request data in FastAPI?",
        "expected_keywords": ["pydantic", "models", "validate"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q5",
        "question": "What HTTP status code does FastAPI return for validation errors?",
        "expected_keywords": ["422"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q6",
        "question": "How do I return error responses in FastAPI?",
        "expected_keywords": ["httpexception", "status"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q7",
        "question": "What are the types of parameters FastAPI supports?",
        "expected_keywords": ["path", "query", "request"],
        "source": "sample.md",
        "type": "factual",
    },
    {
        "id": "q8",
        "question": "What is the capital of France?",
        "expected_keywords": [],
        "source": None,
        "type": "no_answer",  # Should NOT be in corpus
    },
    {
        "id": "q9",
        "question": "How do I create my first FastAPI app and handle errors in it?",
        "expected_keywords": ["main.py", "httpexception", "routes"],
        "source": "sample.md",
        "type": "multi_hop",  # Requires combining multiple chunks
    },
    {
        "id": "q10",
        "question": "What file do I create for a FastAPI app?",
        "expected_keywords": ["main.py"],
        "source": "sample.md",
        "type": "factual",
    },
]