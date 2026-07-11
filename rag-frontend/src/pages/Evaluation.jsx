import { useState, useEffect } from 'react'
import CountUp from '../components/CountUp'
import { Award, CheckCircle2, TrendingUp, BarChart2, Upload, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { getGlobalEvaluation, getUserHistory } from '../lib/api'

const card = "rounded-xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none"

const gradeStyle = {
  HIGH: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  LOW: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
}

function metricTone(value) {
  if (value >= 0.75) return 'bg-emerald-500'
  if (value >= 0.5) return 'bg-amber-500'
  return 'bg-rose-500'
}

export default function Evaluation() {
  const { user } = useAuth0()
  const [globalStats, setGlobalStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, hist] = await Promise.all([
          getGlobalEvaluation(),
          getUserHistory(user?.sub),
        ])
        setGlobalStats(stats)
        setHistory(hist.history || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const summaryCards = globalStats ? [
    { icon: Award, label: 'Correctness', countValue: globalStats.avg_correctness * 100, decimals: 0, suffix: '%', raw: globalStats.avg_correctness },
    { icon: CheckCircle2, label: 'Citation Support', countValue: globalStats.avg_citation_support, decimals: 2, suffix: '', raw: globalStats.avg_citation_support },
    { icon: TrendingUp, label: 'Avg Confidence', countValue: globalStats.avg_confidence, decimals: 3, suffix: '', raw: globalStats.avg_confidence },
    { icon: BarChart2, label: 'Avg Faithfulness', countValue: globalStats.avg_faithfulness, decimals: 3, suffix: '', raw: globalStats.avg_faithfulness },
  ] : []

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Evaluation Results</h1>
      <p className="mt-2 mb-8 text-[14px] text-zinc-500">
        Live system-wide analytics · {globalStats?.total_queries || 0} total queries across all users
      </p>

      {loading ? (
        <p className="mb-10 text-[13.5px] text-zinc-500">Loading stats…</p>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryCards.map((s, i) => (
            <div key={i} className={`${card} overflow-hidden p-5`}>
              <s.icon size={15} className="mb-4 text-zinc-400" />
              <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                <CountUp value={s.countValue} decimals={s.decimals} suffix={s.suffix} duration={2200} />
              </div>
              <div className="mt-1 mb-3 text-[12.5px] text-zinc-500">{s.label}</div>
              <div className="h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className={`h-full rounded-full ${metricTone(s.raw)}`} style={{ width: `${Math.min(100, s.raw * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        <div className="border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Your Query History</h2>
        </div>

        {history.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Inbox size={20} className="text-zinc-400" />
            </div>
            <h3 className="mb-1.5 text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">No Queries Yet</h3>
            <p className="mx-auto mb-5 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Upload documents, start chatting with the assistant, and your evaluation history will appear here.
            </p>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Upload size={14} /> Upload Documents
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {['Question', 'Correct', 'Faithful', 'Retrieval', 'Confidence', 'Time', 'Grade'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-200 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60">
                    <td className="max-w-[280px] px-4 py-2.5 text-[13px] text-zinc-700 dark:text-zinc-300">{r.question}</td>
                    <td className={`px-4 py-2.5 text-[13px] font-semibold ${r.correctness_proxy === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {r.correctness_proxy.toFixed(2)}
                    </td>
                    <td className={`px-4 py-2.5 text-[13px] font-semibold ${r.faithfulness > 0.5 ? 'text-emerald-600 dark:text-emerald-400' : r.faithfulness > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {r.faithfulness.toFixed(2)}
                    </td>
                    <td className={`px-4 py-2.5 text-[13px] font-semibold ${r.retrieval_confidence > 0.5 ? 'text-emerald-600 dark:text-emerald-400' : r.retrieval_confidence > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {r.retrieval_confidence.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-zinc-900 dark:text-zinc-50">{r.confidence_composite.toFixed(3)}</td>
                    <td className="px-4 py-2.5 text-[13px] text-zinc-500">{r.response_time_sec}s</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${gradeStyle[r.grade]}`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}