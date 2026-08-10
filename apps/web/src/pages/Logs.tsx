import { useState } from 'react'
import { LOG_LINES } from '../data/mock'
import { PillButton, SearchField } from '../components/ui'

/**
 * Logs (wireframe 12) — terminal-style live tail (monospace, gray panel),
 * filterable by level (ALL/INFO/WARN/ERROR) and source text.
 */
const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR'] as const

export default function Logs() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('ALL')
  const [q, setQ] = useState('')

  const lines = LOG_LINES.filter(
    (l) => (level === 'ALL' || l.lvl === level) && (q === '' || l.msg.toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Gateway Logs</div>
          <div className="mt-1 text-[13px] text-mc-sub">Live tail of gateway logs, filterable by level and source.</div>
        </div>
        <div className="flex items-center gap-2">
          <PillButton label="Export" />
          <PillButton label="❚❚  Pause" />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        {LEVELS.map((l) => (
          <PillButton key={l} label={l} on={level === l} className="w-[60px] px-0" onClick={() => setLevel(l)} />
        ))}
        <SearchField w={300} h={30} placeholder="Filter by source…" value={q} onChange={setQ} />
      </div>

      {/* Terminal panel */}
      <div className="mt-4 h-[470px] rounded-2xl border border-mc-border bg-mc-inner p-4 font-mono text-[12px] overflow-y-auto">
        {lines.map((l, i) => (
          <div key={i} className="flex whitespace-pre py-[3px]">
            <span className="text-mc-faint w-[80px] shrink-0">{l.tm}</span>
            <span className="w-[52px] shrink-0 font-semibold" style={{ color: l.color }}>{l.lvl}</span>
            <span className="text-mc-text">{l.msg}</span>
          </div>
        ))}
        {lines.length === 0 && <div className="text-mc-faint pt-2">No matching log lines.</div>}
        <div className="mt-3 text-[12px] font-semibold text-mc-greentext">● LIVE TAIL — streaming…</div>
      </div>
    </div>
  )
}
