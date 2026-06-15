import json
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

from bs4 import BeautifulSoup
from pypdf import PdfReader
from rich.console import Console

console = Console()

@dataclass
class Document:
    content: str
    source: str
    file_type: str
    metadata: dict = field(default_factory=dict)
    doc_id: str = ""

    def __post_init__(self):
        if not self.doc_id:
            self.doc_id = f"{Path(self.source).stem}_{datetime.now().strftime('%Y%m%d%H%M%S')}"


def clean_text(text: str) -> str:
    """Remove excess whitespace and normalize text."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def load_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def load_markdown(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def load_html(path: Path) -> str:
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "lxml")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator="\n")


def load_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def load_document(file_path: str | Path) -> Optional[Document]:
    path = Path(file_path)

    if not path.exists():
        console.print(f"[red]File not found: {path}[/red]")
        return None

    ext = path.suffix.lower()
    loaders = {
        ".txt": load_txt,
        ".md": load_markdown,
        ".html": load_html,
        ".htm": load_html,
        ".pdf": load_pdf,
    }

    if ext not in loaders:
        console.print(f"[yellow]Unsupported file type: {ext}[/yellow]")
        return None

    try:
        raw_content = loaders[ext](path)
        clean_content = clean_text(raw_content)

        doc = Document(
            content=clean_content,
            source=str(path),
            file_type=ext.lstrip("."),
            metadata={
                "filename": path.name,
                "file_size": path.stat().st_size,
                "loaded_at": datetime.now().isoformat(),
            }
        )
        console.print(f"[green]✅ Loaded:[/green] {path.name} ({len(clean_content)} chars)")
        return doc

    except Exception as e:
        console.print(f"[red]Failed to load {path.name}: {e}[/red]")
        return None


def load_directory(dir_path: str | Path) -> list[Document]:
    """Load all supported documents from a directory."""
    path = Path(dir_path)
    supported = {".txt", ".md", ".html", ".htm", ".pdf"}
    docs = []

    files = [f for f in path.rglob("*") if f.suffix.lower() in supported]
    console.print(f"\n[bold]Found {len(files)} documents in {path.name}/[/bold]")

    for file in files:
        doc = load_document(file)
        if doc:
            docs.append(doc)

    console.print(f"\n[bold green]Loaded {len(docs)}/{len(files)} documents successfully.[/bold green]")
    return docs


def save_processed(doc: Document, output_dir: Path) -> Path:
    """Save cleaned document + metadata as JSON."""
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"{doc.doc_id}.json"
    payload = {
        "doc_id": doc.doc_id,
        "content": doc.content,
        "source": doc.source,
        "file_type": doc.file_type,
        "metadata": doc.metadata,
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return out_path