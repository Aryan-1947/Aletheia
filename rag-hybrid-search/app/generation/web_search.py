from tavily import TavilyClient
from rich.console import Console
from app.config import TAVILY_API_KEY

console = Console()
client = TavilyClient(api_key=TAVILY_API_KEY)


def search_web(query: str, num_results: int = 4) -> list[dict]:
    """Search web using Tavily and return clean results."""
    try:
        response = client.search(
            query=query,
            search_depth="basic",
            max_results=num_results,
        )
        results = []
        for r in response.get("results", []):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", "")[:400],
                "score": round(r.get("score", 0), 3),
            })
        return results
    except Exception as e:
        console.print(f"[red]Tavily search failed: {e}[/red]")
        return []