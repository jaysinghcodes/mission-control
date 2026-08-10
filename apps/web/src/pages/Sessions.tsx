import { SESSION_ROWS } from '../data/mock'
import { Bot, Card, Progress } from '../components/ui'

/**
 * Sessions (wireframe 10) — active agent sessions with context-pressure bars
 * (red >80%, orange >50%, blue otherwise) and last-activity times.
 */
const COLS = [
  { label: 'SESSION', w: 230 },
  { label: 'AGENT', w: 130 },
  { label: 'MODEL', w: 160 },
  { label: 'CONTEXT', w: 140 },
  { label: 'LAST ACTIVITY', w: 120 },
]

function ctxColor(ctx: number): string {
  if (ctx > 80) return 'var(--mc-red)'
  if (ctx > 50) return 'var(--mc-orange)'
  return 'var(--mc-blue)'
}

export default function Sessions() {
  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Sessions</div>
      <div className="mt-1 text-[13px] text-mc-sub">Active agent sessions, context pressure, and last activity.</div>

      <Card className="mt-6 rounded-2xl px-0 pb-2 overflow-hidden">
        <div className="flex px-[18px] pt-4 pb-2">
          {COLS.map((c) => (
            <div key={c.label} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mc-faint" style={{ width: c.w }}>
              {c.label}
            </div>
          ))}
        </div>
        {SESSION_ROWS.map((row) => (
          <div key={row.session} className="flex items-center px-[18px] h-[68px] border-t border-mc-border2">
            <div className="text-[13px] font-medium" style={{ width: COLS[0].w }}>{row.session}</div>
            <div className="flex items-center gap-2" style={{ width: COLS[1].w }}>
              {row.hot && <span className="w-[5px] h-[5px] rounded-full bg-mc-blue" />}
              <Bot color={row.color} scale={0.8} />
              <span className="text-[12px] font-medium">{row.agent}</span>
            </div>
            <div className="font-mono text-[12px] text-mc-sub" style={{ width: COLS[2].w }}>{row.model}</div>
            <div className="flex items-center gap-2" style={{ width: COLS[3].w }}>
              <Progress pct={row.ctx} color={ctxColor(row.ctx)} w="w-[90px]" />
              <span className="text-[11.5px] text-mc-sub">{row.ctx}%</span>
            </div>
            <div className="text-[12px] text-mc-faint" style={{ width: COLS[4].w }}>{row.last}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
