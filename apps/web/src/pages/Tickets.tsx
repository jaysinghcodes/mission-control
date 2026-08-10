import { TICKET_COLUMNS, TICKET_METRICS, agentColor } from '../data/mock'
import { Bot, Card, Chip, Inner, SectionLabel } from '../components/ui'

/**
 * Tickets (wireframe 03) — kanban board: To-Do / In Progress / Done columns
 * with pipeline metrics row underneath.
 */
const PRIO = {
  high: { bg: 'var(--mc-redbg)', fg: 'var(--mc-redtext)' },
  med: { bg: 'var(--mc-orangebg)', fg: 'var(--mc-orangetext)' },
} as const

export default function Tickets() {
  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Tickets</div>
      <div className="mt-1 text-[13px] text-mc-sub">Kanban board — pipeline stages as columns, with pipeline metrics.</div>

      <div className="flex gap-[18px] mt-8">
        {TICKET_COLUMNS.map((col) => (
          <Card key={col.title} className="w-[248px] shrink-0 px-3.5 py-3">
            <div className="flex items-center justify-between px-1">
              <SectionLabel>{col.title}</SectionLabel>
              <span className="text-[11px] font-semibold text-mc-sub">{col.tickets.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {col.tickets.map((t) => (
                <Inner key={t.id} className="rounded-[10px] px-3 py-2.5">
                  <div className="font-mono text-[11px] font-semibold text-mc-faint">{t.id}</div>
                  <div className="mt-1 text-[13px] font-semibold leading-snug">{t.title}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Chip label={t.prio.toUpperCase()} bg={PRIO[t.prio].bg} fg={PRIO[t.prio].fg} h={18} fs="text-[10px]" />
                    <Bot color={agentColor(t.assignee)} scale={0.8} />
                    <span className="text-[11px] text-mc-sub">{t.assignee}</span>
                  </div>
                  <div className="mt-2 flex gap-3">
                    {t.tags.map((tag) => (
                      <span key={tag} className="text-[10.5px] text-mc-faint">#{tag}</span>
                    ))}
                  </div>
                </Inner>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Pipeline metrics */}
      <div className="flex gap-[10px] mt-6">
        {TICKET_METRICS.map((m) => (
          <Card key={m.label} className="w-[148px] px-3 py-2">
            <div className="text-[18px] font-semibold">{m.value}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-mc-faint">{m.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
