import { useTheme } from '../App'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const socials = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/Aryan-1947' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/aryan-shekhawat-bb26902b8' },
  { icon: FaEnvelope, label: 'Email', href: 'mailto:aryanshekhawat1947@gmail.com' },
]

export default function Footer() {
  const theme = useTheme()

  return (
    <footer style={{
      borderTop: `1px solid ${theme.border}`,
      background: theme.navBg,
      backdropFilter: 'blur(12px)',
      marginTop: 80,
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, padding: 8, display: 'flex' }}>
                <Zap size={18} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>
                RAG<span style={{ color: '#6366f1' }}>Search</span>
              </span>
            </div>
            <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              Production-grade RAG pipeline with hybrid dense + sparse retrieval, citation verification, and confidence scoring.
            </p>
          </div>

          {/* What it does */}
          <div>
            <h3 style={{ color: theme.text, fontWeight: 600, marginBottom: 16, fontSize: 15 }}>What is this?</h3>
            <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.8 }}>
              RAGSearch lets you upload any document (PDF, Markdown, HTML, TXT) and ask natural language questions about it.
              Answers are grounded strictly in your documents with inline citations — no hallucinations.
            </p>
          </div>

          {/* How it works */}
          <div>
            <h3 style={{ color: theme.text, fontWeight: 600, marginBottom: 16, fontSize: 15 }}>How it works</h3>
            <ul style={{ color: theme.textMuted, fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
              <li>📄 Upload your documents</li>
              <li>⚡ Hybrid search finds relevant chunks</li>
              <li>🤖 LLM generates grounded answers</li>
              <li>✅ Citations are verified automatically</li>
              <li>📊 Confidence scores on every answer</li>
            </ul>
          </div>

          {/* Built by */}
          <div>
            <h3 style={{ color: theme.text, fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Built by</h3>
            <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 20 }}>
  <span style={{ color: theme.text, fontWeight: 600 }}>Aryan Shekhawat</span><br />
  AI & ML Engineer
</p>
            {socials.map(({ icon: Icon, label, href }) => (
  <motion.a
    key={label} href={href} target="_blank" rel="noopener noreferrer"
    whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 40, height: 40, borderRadius: 10,
      border: `1px solid ${theme.border}`,
      background: theme.bgCard, color: theme.textSub,
      textDecoration: 'none', transition: 'all 0.2s',
    }}
    title={label}
  >
    <Icon size={18} />
  </motion.a>
))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${theme.border}`,
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>
            © 2026 Aryan Shekhawat · Built with Groq LLaMA-3.3-70b + Google Gemini Embeddings
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['FastAPI', 'ChromaDB', 'BM25', 'React', 'Tailwind'].map(t => (
              <span key={t} style={{
                fontSize: 12, color: theme.textMuted,
                background: theme.bgCard, border: `1px solid ${theme.border}`,
                padding: '3px 10px', borderRadius: 100,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}