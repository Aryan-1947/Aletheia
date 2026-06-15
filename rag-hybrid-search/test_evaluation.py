from app.evaluation.evaluator import run_evaluation

# Run eval on hybrid mode with reranker
summary = run_evaluation(
    mode="hybrid",
    use_reranker=True,
    strategy_label="recursive",
)

print(f"\n✅ Evaluation complete!")
print(f"Correct: {summary['pct_correct']}%")
print(f"Faithfulness: {summary['avg_faithfulness']}")
print(f"Avg Confidence: {summary['avg_confidence']}")