import { useState } from 'react'
import { useApi, apiPost } from '../hooks/useApi'
import { Bot, Card, Chip, Inner, PillButton, SectionLabel } from '../components/ui'

/**
 * Tickets — full-page kanban fed by the API. Columns flex to fill the whole
 * width (Jay's feedback), cards are roomy, and "+ New ticket" creates real
 * tickets (backlog) the bridge can pick up.
 */

interface Ticket { id: string; key: string | null; title: string; status: string; priority: string; assignee: string | null; tags: string[] | null; createdAt: string }
interface TicketsResp { tickets: Ticket[] }

const PRIO: Record<string, { bg: string; fg: string }> = {
  high: { bg: 'var(--mc-redbg)', fg: 'var(--mc-redtext)' },
  med: { bg: 'var(--mc-orangebg)', fg: 'var(--mc-orangetext)' },
  low: { bg: 'var(--mc-inner)', fg: 'var(--mc-sub)' },
}

const COLUMNS = [
  { title: 'To-Do', status: 'todo' },
  { title: 'In Progress', status: 'inprogress' },
  { title: 'Done', status: 'done' },
]

export default function Tickets() {
  const { data, refetch } = useApi<TicketsResp>('/tickets', { pollMs: 15000 })
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const tickets = data?.tickets ?? []

  async function create() {
    const t = title.trim()
    if (!t || busy) return
    setBusy(true)
    await apiPost('/tickets', { title: t, priority: 'med' })
    setTitle('')
    setBusy(false)
    void refetch()
  }

  const metrics = [
    { label: 'Shipped Today', value: String(tickets.filter((t) => t.status === 'done').length) },
    { label: 'In Progress', value: String(tickets.filter((t) => t.status === 'inprogress').length) },
    { label: 'Backlog', value: String(tickets.filter((t) => t.status === 'backlog').length) },
    { label: 'Blocked', value: '0' },
    { label: 'Total Tickets', value: String(tickets.length) },
  ]

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[22px] font-semibold">Tickets</div>
          <div className="mt-1 text-[13px] text-mc-sub">Kanban board — pipeline stages as columns, live from the API.</div>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void create()}
            placeholder="New ticket title…"
            className="h-9 w-64 rounded-full border border-mc-border bg-mc-card px-4 text-[13px] text-mc-text placeholder:text-mc-faint outline-none focus:border-mc-primary"
          />
          <PillButton label="+ New ticket" on onClick={() => void create()} />
        </div>
      </div>

      {/* Kanban — columns fill the full width (Jay's feedback) */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {COLUMNS.map((col) => {
          const rows = tickets.filter((t) => t.status === col.status)
          return (
            <Card key={col.title} className="px-3.5 py-3 min-h-[380px]">
              <div className="flex items-center justify-between px-1">
                <SectionLabel>{col.title}</SectionLabel>
                <span className="text-[11px] font-semibold text-mc-sub">{rows.length}</span>
              </div>
              <div className="mt-3 space-y-3">
                {rows.length === 0 && (
                  <div className="text-[12px] text-mc-faint px-1 py-4">
                    {col.title === 'Done' ? 'Nothing shipped yet.' : col.title === 'To-Do' ? 'Empty — create a ticket above.' : 'No work in progress.'}
                  </div>
                )}
                {rows.map((t) => (
                  <Inner key={t.id} className="rounded-[10px] px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-mc-faint">{t.key ?? t.id.slice(0, 8)}</span>
                      <Chip label={t.priority.toUpperCase()} bg={PRIO[t.priority]?.bg ?? PRIO.med.bg} fg={PRIO[t.priority]?.fg ?? PRIO.med.fg} h={18} fs="text-[10px]" />
                    </div>
                    <div className="mt-1.5 text-[13px] font-semibold leading-snug">{t.title}</div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Bot color={t.assignee ? 'var(--mc-primary)' : 'var(--mc-faint)'} scale={0.8} />
                      <span className="text-[11px] text-mc-sub truncate">{t.assignee ?? 'unassigned'}</span>
                    </div>
                    {t.tags && t.tags.length > 0 && (
                      <div className="mt-2 flex gap-3">
                        {t.tags.map((tag) => (
                          <span key={tag} className="text-[10.5px] text-mc-faint">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </Inner>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pipeline metrics */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {metrics.map((m) => (
          <Card key={m.label} className="px-3 py-2">
            <div className="text-[18px] font-semibold">{m.value}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-mc-faint">{m.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
