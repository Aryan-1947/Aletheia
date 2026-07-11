import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, RefreshCw, CheckCircle2, Loader2, File, Info, ChevronDown, ChevronUp, Trash2, PartyPopper, X } from 'lucide-react'
import { getDocuments, getStats, uploadDocument, ingestDocuments, getIngestedFiles, deleteDocument, getDocumentViewUrl } from '../lib/api'
import { Link } from 'react-router-dom'

const card = "rounded-xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none"

const extColor = { pdf: 'text-rose-600 dark:text-rose-400', md: 'text-indigo-600 dark:text-indigo-400', txt: 'text-emerald-600 dark:text-emerald-400', html: 'text-amber-600 dark:text-amber-400' }

const strategyInfo = {
  fixed: 'Cuts every 500 chars. Fast, simple.',
  recursive: 'Splits on paragraphs/sentences. Recommended for most docs.',
  semantic: 'AI-detected topic boundaries. Slower, uses more API calls.',
}

const ALLOWED_EXTENSIONS = ['.pdf', '.md', '.txt', '.html', '.htm']

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Documents() {
  const { user } = useAuth0()
  const fileInputRef = useRef(null)
  const [docs, setDocs] = useState([])
  const [stats, setStats] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [message, setMessage] = useState(null)
  const [strategy, setStrategy] = useState('recursive')
  const [ingestedFiles, setIngestedFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectorOpen, setSelectorOpen] = useState(true)
  const [ingestionPolling, setIngestionPolling] = useState(false)
  const [ingestionDone, setIngestionDone] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const load = async () => {
    try {
      const [d, s, ingested] = await Promise.all([
        getDocuments(user?.sub),
        getStats(user?.sub),
        getIngestedFiles(user?.sub),
      ])
      setDocs(d.documents); setStats(s)
      const ingestedList = ingested.ingested || []
      setIngestedFiles(ingestedList)

      const newFiles = d.documents
        .filter(doc => !ingestedList.includes(doc.filename))
        .map(doc => doc.filename)

      setSelectedFiles(newFiles)
      setSelectorOpen(true)
    } catch {}
  }

  useEffect(() => { load() }, [user])

  const processFile = async (file) => {
    if (!file) return

    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setMessage({ type: 'error', text: `Unsupported file type: ${ext}. Please use PDF, MD, TXT, or HTML.` })
      return
    }

    const alreadyIndexed = ingestedFiles.includes(file.name)
    const existingDoc = docs.find(d => d.filename === file.name)

    if (existingDoc) {
      const proceed = window.confirm(
        alreadyIndexed
          ? `"${file.name}" has already been ingested. Uploading it again will save it as a new copy (e.g. "${file.name.replace(/(\.[^.]+)$/, ' (1)$1')}") and it will need to be ingested separately. Continue?`
          : `"${file.name}" already exists but hasn't been ingested yet. Uploading again will save it as a new copy. Continue?`
      )
      if (!proceed) return
    }

    setPendingFile({ name: file.name, size: formatSize(file.size), status: 'uploading' })
    setUploading(true); setMessage(null)
    try {
      const res = await uploadDocument(file, user?.sub)
      const savedName = res.filename || file.name
      setPendingFile({ name: savedName, size: formatSize(file.size), status: 'uploaded' })
      setMessage({
        type: 'success',
        text: res.renamed
          ? `Uploaded as "${savedName}" (renamed to avoid overwriting the existing file) — now click Run Ingestion to index it.`
          : `Uploaded: ${savedName} — now click Run Ingestion to index it.`,
      })
      load()
    } catch {
      setPendingFile({ name: file.name, size: formatSize(file.size), status: 'error' })
      setMessage({ type: 'error', text: 'Upload failed' })
    }
    finally { setUploading(false) }
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    processFile(file)
  }

  const handleRemovePending = async () => {
    if (pendingFile?.status === 'uploaded') {
      try {
        await deleteDocument(pendingFile.name, user?.sub)
        setMessage({ type: 'success', text: `Removed: ${pendingFile.name}` })
        load()
      } catch {
        setMessage({ type: 'error', text: 'Could not remove the file from your documents' })
      }
    }
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)
    if (pendingFile) return
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const handleIngest = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one file to ingest.' })
      return
    }
    setIngesting(true); setMessage(null); setIngestionDone(false)
    try {
      const r = await ingestDocuments(strategy, user?.sub, selectedFiles)
      if (r.status === 'processing') {
        setMessage({ type: 'info', text: 'Indexing in progress...' })
        setSelectorOpen(false)
        setIngestionPolling(true)
        const poll = setInterval(async () => {
          const ingested = await getIngestedFiles(user?.sub)
          const allDone = selectedFiles.every(f => ingested.ingested.includes(f))
          if (allDone) {
            clearInterval(poll)
            setIngestionPolling(false)
            setIngestionDone(true)
            setMessage({ type: 'success', text: 'Indexing complete! Your documents are ready.' })
            setPendingFile(null) // clear the upload-card preview now that ingestion succeeded
            load()
          }
        }, 10000)
      } else {
        setMessage({ type: 'success', text: `Ingested ${r.chunks} chunks from ${r.documents} documents` })
        setSelectorOpen(false)
        setIngestionDone(true)
        setPendingFile(null) // clear the upload-card preview now that ingestion succeeded
        load()
      }
    } catch { setMessage({ type: 'error', text: 'Ingestion failed' }) }
    finally { setIngesting(false) }
  }

  const newFilesCount = docs.filter(d => !ingestedFiles.includes(d.filename)).length

  const messageStyle = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
    error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
    info: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400',
  }

  const pendingStatusText = {
    ready: 'Ready to upload',
    uploading: 'Uploading…',
    uploaded: 'Uploaded — run ingestion to index it',
    error: 'Upload failed',
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Documents</h1>
      <p className="mt-2 mb-8 text-[14px] text-zinc-500">Upload and manage your document corpus. Supports PDF, Markdown, HTML, and TXT.</p>

      {stats && (
        <div className="mb-8 flex gap-3">
          <div className={`${card} px-6 py-4`}>
            <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.total_chunks}</div>
            <div className="text-[12.5px] text-zinc-500">Indexed Chunks</div>
          </div>
          <div className={`${card} px-6 py-4`}>
            <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{docs.length}</div>
            <div className="text-[12.5px] text-zinc-500">Documents</div>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          onClick={() => !pendingFile && fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`${card} flex flex-col items-center justify-center border-dashed p-8 text-center transition-all duration-150 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50/50 dark:border-indigo-500/50 dark:bg-indigo-500/10'
              : pendingFile
                ? pendingFile.status === 'error'
                  ? 'border-rose-300 dark:border-rose-500/40'
                  : 'border-emerald-300 dark:border-emerald-500/40'
                : 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          {isDragging ? (
            <>
              <Upload size={22} className="mb-3 text-indigo-500" />
              <p className="text-[13.5px] font-medium text-indigo-600 dark:text-indigo-400">Drop your file here</p>
            </>
          ) : !pendingFile ? (
            <>
              <Upload size={22} className="mb-3 text-zinc-400" />
              <p className="mb-1 text-[13.5px] text-zinc-600 dark:text-zinc-400">Drag & drop, or click to upload</p>
              <p className="mb-4 text-[12px] text-zinc-500">PDF, MD, TXT, or HTML — run ingestion after uploading.</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Upload size={14} />
                Choose File
                <input ref={fileInputRef} type="file" accept=".pdf,.md,.txt,.html" onChange={handleUpload} className="hidden" />
              </label>
            </>
          ) : (
            <div onClick={e => e.stopPropagation()}>
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
                pendingFile.status === 'error' ? 'bg-rose-100 dark:bg-rose-500/10' : 'bg-emerald-100 dark:bg-emerald-500/10'
              }`}>
                {pendingFile.status === 'uploading'
                  ? <Loader2 size={20} className="animate-spin text-zinc-500" />
                  : <File size={20} className={pendingFile.status === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} />}
              </div>
              <p className="mb-1 max-w-[220px] truncate text-[13.5px] font-medium text-zinc-800 dark:text-zinc-200" title={pendingFile.name}>
                {pendingFile.name}
              </p>
              <p className="mb-4 text-[12px] text-zinc-500">
                {pendingFile.size} · {pendingStatusText[pendingFile.status]}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRemovePending}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-[12.5px] font-medium text-rose-600 transition-all duration-150 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <X size={13} /> Remove
                </button>
                <label className="cursor-pointer text-[12.5px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-200">
                  or click to replace
                  <input ref={fileInputRef} type="file" accept=".pdf,.md,.txt,.html" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={`${card} p-6`}>
          <h3 className="mb-1 text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Re-index Documents</h3>
          <p className="mb-4 text-[12.5px] text-zinc-500">Rebuild the search index with your chosen chunking strategy.</p>

          {docs.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="mb-2 flex w-full items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-[13px] text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
              >
                <span>
                  Select files to ingest
                  {newFilesCount > 0 && (
                    <span className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400">({newFilesCount} new)</span>
                  )}
                </span>
                {selectorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {selectorOpen && (
                <div>
                  <div className="mb-2 flex justify-end">
                    <button
                      onClick={() => setSelectedFiles(selectedFiles.length === docs.length ? [] : docs.map(d => d.filename))}
                      className="text-[12px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {selectedFiles.length === docs.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                    {docs.map((d, i) => {
                      const isNew = !ingestedFiles.includes(d.filename)
                      const isChecked = selectedFiles.includes(d.filename)
                      return (
                        <label key={i} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[13px] dark:border-zinc-800">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedFiles(prev => isChecked ? prev.filter(f => f !== d.filename) : [...prev, d.filename])
                            }}
                          />
                          <span className="flex-1 text-zinc-700 dark:text-zinc-300">{d.filename}</span>
                          {isNew
                            ? <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">NEW</span>
                            : <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">INDEXED</span>}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-2 flex gap-1.5">
            {['fixed', 'recursive', 'semantic'].map(s => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-all duration-150 ${
                  strategy === s
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mb-4 flex items-center gap-1.5 text-[12px] text-zinc-500">
            <Info size={12} /> {strategyInfo[strategy]}
          </p>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {ingesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {ingesting ? 'Indexing' : `Run Ingestion (${selectedFiles.length})`}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-[13px] ${messageStyle[message.type]}`}>
          {message.text}
        </div>
      )}

      {ingestionDone && (
        <div className={`${card} mb-6 flex items-center justify-between p-4`}>
          <span className="flex items-center gap-2 text-[13.5px] text-zinc-700 dark:text-zinc-300">
            <PartyPopper size={15} className="text-indigo-600 dark:text-indigo-400" />
            Documents indexed! Start asking questions.
          </span>
          <Link
            to="/ask"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ask Now →
          </Link>
        </div>
      )}

      {ingestionPolling && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <Loader2 size={14} className="animate-spin" />
          Indexing in progress — checking every 10 seconds.
        </div>
      )}

      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Uploaded Documents</h2>
      {docs.length === 0 ? (
        <p className="py-10 text-center text-[13.5px] text-zinc-500">No documents yet. Upload one above.</p>
      ) : (
        <div className={`${card} divide-y divide-zinc-200 dark:divide-zinc-800`}>
          {docs.map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <File size={16} className={extColor[d.type] || 'text-indigo-600 dark:text-indigo-400'} />
              <div className="min-w-0 flex-1">
                <a
                  href={getDocumentViewUrl(d.filename, user?.sub)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-[13.5px] font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-400"
                >
                  {d.filename}
                </a>
                <div className="text-[11.5px] text-zinc-500">{d.size_kb} KB · {d.type.toUpperCase()}</div>
              </div>
              {ingestedFiles.includes(d.filename)
                ? <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                : <span className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Not indexed</span>}
              <button
                onClick={async () => {
                  if (!window.confirm(`Delete ${d.filename}?`)) return
                  try {
                    await deleteDocument(d.filename, user?.sub)
                    setMessage({ type: 'success', text: `Deleted: ${d.filename}` })
                    load()
                  } catch {
                    setMessage({ type: 'error', text: 'Delete failed' })
                  }
                }}
                className="rounded-lg p-1.5 text-zinc-400 transition-all duration-150 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}