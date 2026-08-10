import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * SearchBox — the topbar search. Debounced query → GET /search → grouped
 * dropdown (tasks/tickets/agents/sessions/approvals/activity/logs). Clicking
 * a result jumps to the right screen; Enter takes the first result; Esc or
 * outside-click closes. Empty input / no results shows a hint.
 */

interface Hit { id?: string; name?: string; title?: string; key?: string | null; agent?: string | null; desc?: string; tag?: string; type?: string; msg?: string; role?: string | null }
interface SearchResults {
  tasks: Hit[]; tickets: Hit[]; agents: Hit[]; sessions: Hit[]; approvals: Hit[]; activity: Hit[]; logs: { tm: string; lvl: string; msg: string }[]
}
interface SearchResp { query: string; results: SearchResults }

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const GROUPS: { key: keyof SearchResults; label: string; path: string; field: (h: Hit) => string }[] = [
  { key: 'tasks', label: 'Tasks', path: '/tasks', field: (h) => h.name ?? h.title ?? '' },
  { key: 'tickets', label: 'Tickets', path: '/tickets', field: (h) => `${h.key ?? ''} · ${h.title}` },
  { key: 'agents', label: 'Agents', path: '/agents', field: (h) => h.name ?? '' },
  { key: 'sessions', label: 'Sessions', path: '/sessions', field: (h) => h.name ?? '' },
  { key: 'approvals', label: 'Approvals', path: '/approvals', field: (h) => h.desc ?? h.tag ?? '' },
  { key: 'activity', label: 'Activity', path: '/activity', field: (h) => `${h.type ?? ''}${h.name ? ' · ' + h.name : ''}` },
  { key: 'logs', label: 'Logs', path: '/logs', field: (h) => h.msg ?? '' },
]

export default function SearchBox({ w = 220 }: { w?: number }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  // Debounced fetch
  useEffect(() => {
    const query = q.trim()
    if (query.length < 2) {
      setResults(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(((await res.json()) as SearchResp).results)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  // Close on outside click / Escape
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const total = results
    ? GROUPS.reduce((n, g) => n + (results[g.key]?.length ?? 0), 0)
    : 0

  function go(path: string) {
    setOpen(false)
    setQ('')
    setResults(null)
    nav(path)
  }

  function goFirst() {
    for (const g of GROUPS) {
      const first = results?.[g.key]?.[0]
      if (first) {
        go(g.path)
        return
      }
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-full border border-mc-border bg-mc-inner px-3" style={{ width: w, height: 32 }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="var(--mc-faint)" strokeWidth="1.5" />
          <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="var(--mc-faint)" strokeWidth="1.5" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goFirst()
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
          className="w-full bg-transparent text-[12.5px] text-mc-text placeholder:text-mc-faint outline-none"
        />
        {loading && <span className="w-3 h-3 rounded-full border-2 border-mc-faint border-t-transparent animate-spin shrink-0" />}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 top-10 z-50 w-[420px] max-h-[440px] overflow-y-auto rounded-xl border border-mc-border bg-mc-card shadow-xl shadow-black/40">
          {total === 0 && !loading && (
            <div className="px-4 py-6 text-[12.5px] text-mc-faint">No results for “{q.trim()}”.</div>
          )}
          {GROUPS.map((g) => {
            const hits = (results?.[g.key] ?? []) as Hit[]
            if (hits.length === 0) return null
            return (
              <div key={g.key} className="py-1.5">
                <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-mc-faint">
                  {g.label} · {hits.length}
                </div>
                {hits.map((h, i) => (
                  <button
                    key={h.id ?? `${g.key}-${i}`}
                    type="button"
                    onClick={() => go(g.path)}
                    className="w-full text-left px-4 py-1.5 hover:bg-mc-inner flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-mc-primary shrink-0" />
                    <span className="text-[12.5px] text-mc-text truncate">{g.field(h)}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
