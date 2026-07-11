import { useLocation } from 'react-router-dom'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

const socials = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/Aryan-1947' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/aryan-shekhawat-bb26902b8' },
  { icon: FaEnvelope, label: 'Email', href: 'mailto:aryanshekhawat1947@gmail.com' },
]

const stack = ['FastAPI', 'ChromaDB', 'BM25', 'React', 'Tailwind']

export default function Footer() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  if (!isLanding) {
    return (
      <footer className="border-t border-zinc-200 bg-white/95 backdrop-blur-md transition-colors duration-150 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <p className="text-[13px] text-zinc-500">© 2026 Aryan Shekhawat</p>
          <div className="flex flex-wrap gap-2">
            {stack.map(t => (
              <span
                key={t}
                className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-zinc-200 bg-white/95 backdrop-blur-md transition-colors duration-150 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white dark:fill-zinc-900">
                  <path d="M12 2 L22 20 L17.5 20 L12 9.5 L6.5 20 L2 20 Z" />
                </svg>
              </span>
              <span className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Aletheia
              </span>
            </div>
            <p className="max-w-[240px] text-[13px] leading-relaxed text-zinc-500">
              Production-grade RAG pipeline with hybrid dense + sparse retrieval, citation verification, and confidence scoring.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">What is this?</h3>
            <p className="text-[13px] leading-relaxed text-zinc-500">
              Upload any document (PDF, Markdown, HTML, TXT) and ask natural language questions. Answers are grounded strictly in your documents with inline citations.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">How it works</h3>
            <ul className="space-y-2 text-[13px] text-zinc-500">
              <li>Upload your documents</li>
              <li>Hybrid search finds relevant chunks</li>
              <li>LLM generates grounded answers</li>
              <li>Citations verified automatically</li>
              <li>Confidence scored on every answer</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Built by</h3>
            <p className="mb-5 text-[13px] text-zinc-500">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Aryan Shekhawat</span><br />
              AI &amp; ML Engineer
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-all duration-150 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-[13px] text-zinc-500">
            © 2026 Aryan Shekhawat · Built with Groq LLaMA-3.3-70b + Google Gemini Embeddings
          </p>
          <div className="flex flex-wrap gap-2">
            {stack.map(t => (
              <span
                key={t}
                className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}