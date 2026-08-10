import { BACKLOG_ROWS } from '../data/mock'
import { Card, Chip, PillButton } from '../components/ui'

/**
 * Backlog (wireframe 04) — ranked, tagged table of not-yet-started tickets
 * with a "+ New ticket" primary action.
 */
const PRIO = {
  high: { bg: 'var(--mc-redbg)', fg: 'var(--mc-redtext)' },
  med: { bg: 'var(--mc-orangebg)', fg: 'var(--mc-orangetext)' },
  low: { bg: 'var(--mc-inner)', fg: 'var(--mc-sub)' },
} as const

const COLS = [
  { label: 'TICKET', w: 120 },
  { label: 'TITLE', w: 250 },
  { label: 'PRIORITY', w: 100 },
  { label: 'TAGS', w: 130 },
  { label: 'POINTS', w: 70 },
  { label: 'AGE', w: 110 },
]

export default function Backlog() {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Backlog</div>
          <div className="mt-1 text-[13px] text-mc-sub">Every ticket not yet started — ranked, tagged, ready to pull.</div>
        </div>
        <PillButton label="+  New ticket" on className="mt-1" />
      </div>

      <Card className="mt-8 rounded-2xl px-0 pb-2 overflow-hidden">
        <div className="flex px-[18px] pt-4 pb-2">
          {COLS.map((c) => (
            <div key={c.label} className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mc-faint" style={{ width: c.w }}>
              {c.label}
            </div>
          ))}
        </div>
        {BACKLOG_ROWS.map((row) => (
          <div key={row.id} className="flex items-center px-[18px] h-16 border-t border-mc-border2">
            <div className="font-mono text-[11.5px] font-semibold text-mc-faint" style={{ width: COLS[0].w }}>{row.id}</div>
            <div className="text-[13px] font-medium" style={{ width: COLS[1].w }}>{row.title}</div>
            <div style={{ width: COLS[2].w }}>
              <Chip label={row.prio.toUpperCase()} bg={PRIO[row.prio].bg} fg={PRIO[row.prio].fg} h={19} fs="text-[10px]" />
            </div>
            <div className="flex gap-3 text-[11px] text-mc-faint" style={{ width: COLS[3].w }}>
              {row.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
            <div className="text-[12px] text-mc-sub" style={{ width: COLS[4].w }}>{row.pts}</div>
            <div className="text-[12px] text-mc-faint" style={{ width: COLS[5].w }}>{row.age}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
