import { useState } from 'react'
import { APPROVAL_FILTERS, APPROVAL_ROWS } from '../data/mock'
import { Card, Inner, PillButton } from '../components/ui'

/**
 * Approvals (wireframe 06) — everything waiting on Jay, approve/reject in one
 * click. Filter pills (All / Exec / Pairing / Messages / Sessions) are live.
 */
const KIND_ICON: Record<string, { glyph: string; color: string }> = {
  exec: { glyph: '›_', color: 'var(--mc-red)' },
  pair: { glyph: '⧉', color: 'var(--mc-blue)' },
  msg: { glyph: '✉', color: 'var(--mc-purple)' },
  sess: { glyph: '⑂', color: 'var(--mc-teal)' },
}

export default function Approvals() {
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? APPROVAL_ROWS : APPROVAL_ROWS.filter((r) => r.tag.startsWith(filter.toLowerCase()))

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Approvals</div>
      <div className="mt-1 text-[13px] text-mc-sub">Everything waiting on you — approve or reject in one click.</div>

      <div className="flex gap-3 mt-6">
        {APPROVAL_FILTERS.map((f) => (
          <PillButton key={f} label={f} on={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <Card className="mt-6 rounded-2xl px-0 pb-1 overflow-hidden">
        {rows.map((row, i) => {
          const icon = KIND_ICON[row.kind]
          return (
            <div key={row.desc} className={`flex items-center px-[18px] py-4 ${i < rows.length - 1 ? 'border-b border-mc-border2' : ''}`}>
              <Inner className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[13px] font-semibold mr-4" >
                <span style={{ color: icon.color }}>{icon.glyph}</span>
              </Inner>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: row.color }}>{row.tag}</div>
                <div className="text-[13px] font-medium mt-0.5 truncate">{row.desc}</div>
              </div>
              <span className="text-[11.5px] text-mc-faint mr-6 whitespace-nowrap">{row.ago}</span>
              <PillButton label="Approve" on className="mr-2" style={{ backgroundColor: 'var(--mc-green)' }} />
              <PillButton label="Reject" />
            </div>
          )
        })}
      </Card>
    </div>
  )
}
