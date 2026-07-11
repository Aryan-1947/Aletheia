import { Link } from 'react-router-dom'
import { useRef } from 'react'
import VariableProximity from '../components/VariableProximity'
import CountUp from '../components/CountUp'
import { useState, useEffect } from 'react'
import { Search, Shield, Zap, GitMerge, Globe, BarChart2, ArrowRight, Upload, MessageSquare, Layers, FileText, Users } from 'lucide-react'
import { getGlobalPlatformStats } from '../lib/api'

const steps = [
  { icon: Upload, title: 'Upload Documents', desc: 'Upload PDFs, markdown, HTML or text files to your personal document space.' },
  { icon: Zap, title: 'Index & Search', desc: 'Hybrid retrieval finds the most relevant chunks using both semantic and keyword search.' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Get grounded answers with verified citations and confidence scores instantly.' },
]

const features = [
  { icon: GitMerge, title: 'Hybrid Search', desc: 'Combines dense vector search with BM25 sparse retrieval via Reciprocal Rank Fusion.' },
  { icon: Shield, title: 'Citation Verification', desc: 'Every claim is verified against source chunks using LLM-as-judge.' },
  { icon: Zap, title: 'Cross-Encoder Reranking', desc: 'Top candidates are reranked for maximum precision before generation.' },
  { icon: BarChart2, title: 'Confidence Scoring', desc: 'A composite score across retrieval, faithfulness, and completeness.' },
  { icon: Layers, title: 'Dual Grounding Modes', desc: 'Switch between Strict (docs only) and Balanced (docs + AI knowledge) answers.' },
  { icon: Globe, title: 'Web Search Fallback', desc: 'Not enough in your docs? Pull in live web results without leaving the answer.' },
]

const card = "rounded-xl border border-zinc-300 bg-white shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-[0_0_0_1px_rgba(79,70,229,0.15),0_0_20px_rgba(79,70,229,0.1)] dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none dark:hover:border-indigo-500/40 dark:hover:shadow-[0_0_0_1px_rgba(129,140,248,0.15),0_0_24px_rgba(129,140,248,0.15)]"
const subtleBtn = "inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/70 px-4 py-2.5 text-[14px] font-medium text-zinc-700 backdrop-blur-sm transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
const primaryBtn = "inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"

export default function Landing() {
  const heroRef = useRef(null)
  const [platformStats, setPlatformStats] = useState(null)

  useEffect(() => {
    getGlobalPlatformStats().then(setPlatformStats).catch(() => setPlatformStats(null))
  }, [])

  const benchmarks = platformStats ? [
    { label: 'Documents Indexed', value: platformStats.total_documents, icon: FileText },
    { label: 'Chunks Indexed', value: platformStats.total_chunks, icon: Layers },
    { label: 'Questions Answered', value: platformStats.total_queries, icon: MessageSquare },
    { label: 'Active Users', value: platformStats.active_users, icon: Users },
  ] : []

  return (
    <div className="mx-auto max-w-6xl px-6">

      {/* Hero */}
      <div className="-mx-6 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex flex-col items-center py-24 text-center sm:py-32">
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
            Hybrid retrieval, grounded generation
          </div>

          <h1
            ref={heroRef}
            className="max-w-3xl text-[52px] font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-[68px] dark:text-zinc-50"
          >
            <VariableProximity
              label="Ask anything about your documents"
              containerRef={heroRef}
              fromFontVariationSettings="'wght' 500, 'opsz' 20"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              radius={120}
              falloff="linear"
            />
          </h1>

          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-zinc-500">
            Upload internal docs, wikis, and PDFs. Choose Strict or Balanced grounding, fall back to a live web search when your docs come up short, and get every answer with verified citations and confidence scores.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/ask" className={primaryBtn}>
              Start Asking <ArrowRight size={15} />
            </Link>
            <Link to="/documents" className={subtleBtn}>
              <Upload size={15} /> Manage Documents
            </Link>
          </div>
        </div>
      </div>

      {/* Platform stats — real numbers from /v1/stats/global, distinct from
          the Evaluation page's correctness/confidence metrics */}
      <div className="py-16">
        <div className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
          Platform Activity
        </div>
        {!platformStats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`${card} h-[104px] animate-pulse p-5`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {benchmarks.map((b, i) => (
              <div key={i} className={`${card} p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700`}>
                <b.icon size={15} className="mb-3 text-indigo-600 dark:text-indigo-400" />
                <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  <CountUp value={b.value} duration={2200} />
                </div>
                <div className="mt-1 text-[12.5px] text-zinc-500">{b.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="py-16">
        <h2 className="mb-1 text-[24px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">How it works</h2>
        <p className="mb-8 text-[14px] text-zinc-500">Three steps to intelligent document search</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className={`${card} p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700`}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                <s.icon size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="mb-1 text-[12px] font-medium text-indigo-600 dark:text-indigo-400">Step {i + 1}</div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <h2 className="mb-1 text-[24px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Built for production</h2>
        <p className="mb-8 text-[14px] text-zinc-500">Every component designed for real-world reliability</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className={`${card} p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700`}>
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                <f.icon size={15} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-1.5 text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={`${card} mb-16 px-8 py-14 text-center`}>
        <h2 className="mb-2 text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Ready to search your docs?</h2>
        <p className="mb-6 text-[14px] text-zinc-500">Upload a document and ask your first question in under 2 minutes.</p>
        <Link to="/documents" className={primaryBtn}>
          <Upload size={15} /> Upload Your First Document
        </Link>
      </div>

    </div>
  )
}