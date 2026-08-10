import { useState } from 'react'
import { useApi, apiPost } from '../hooks/useApi'
import { Bot, Card, Chip, PillButton, Progress } from '../components/ui'

/**
 * Tasks — REAL runs from the API. Create a task from the "+ New task" field;
 * the OpenClaw bridge picks up queued runs and executes them, so tasks move
 * queued → running → done live via Socket.IO broadcasts (page polls too).
 */

interface Run { id: string; name: string; agent: string | null; status: string; progress: number; createdAt: string }
interface RunsResp { runs: Run[] }

const STATUS_CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  running: { bg: 'var(--mc-bluebg)', fg: 'var(--mc-bluetext)', label: 'RUNNING' },
  queued: { bg: 'var(--mc-orangebg)', fg: 'var(--mc-orangetext)', label: 'QUEUED' },
  done: { bg: 'var(--mc-greenbg)', fg: 'var(--mc-greentext)', label: 'DONE' },
  failed: { bg: 'var(--mc-redbg)', fg: 'var(--mc-redtext)', label: 'FAILED' },
  needs_approval: { bg: 'var(--mc-yellowbg)', fg: 'var(--mc-orangetext)', label: 'NEEDS APPROVAL' },
}

export default function Tasks() {
  const { data, refetch } = useApi<RunsResp>('/runs', { pollMs: 15000 })
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    const name = title.trim()
    if (!name || busy) return
    setBusy(true)
    await apiPost('/runs', { name })
    setTitle('')
    setBusy(false)
    void refetch()
  }

  const groups: { title: string; statuses: string[] }[] = [
    { title: 'In Flight', statuses: ['running'] },
    { title: 'Queued', statuses: ['queued', 'needs_approval'] },
    { title: 'Done Today', statuses: ['done', 'failed'] },
  ]

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Tasks</div>
          <div className="mt-1 text-[13px] text-mc-sub">Real runs from OpenClaw — in flight, queued, and done.</div>
        </div>
      </div>

      {/* Create task — always available */}
      <div className="flex items-center gap-3 mt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void create()}
          placeholder="Give Jarvis a task… e.g. run the web tests"
          className="h-9 flex-1 max-w-md rounded-full border border-mc-border bg-mc-card px-4 text-[13px] text-mc-text placeholder:text-mc-faint outline-none focus:border-mc-primary"
        />
        <PillButton label="+ New task" on onClick={() => void create()} />
      </div>

      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          const rows = (data?.runs ?? []).filter((r) => group.statuses.includes(r.status))
          return (
            <div key={group.title}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mc-faint mb-2.5">{group.title}</div>
              {rows.length === 0 ? (
                <Card className="px-4 py-6 text-[12.5px] text-mc-faint">
                  Nothing {group.title.toLowerCase()}. {group.title === 'Queued' ? 'Use the field above to give Jarvis a task.' : ''}
                </Card>
              ) : (
                <Card className="px-0 py-1">
                  {rows.map((row, i) => {
                    const chip = STATUS_CHIP[row.status] ?? STATUS_CHIP.queued
                    return (
                      <div key={row.id} className={`flex items-center gap-4 px-4 h-[50px] ${i < rows.length - 1 ? 'border-b border-mc-border2' : ''}`}>
                        <span className="text-[13px] font-medium w-[300px] truncate">{row.name}</span>
                        <Bot color={row.agent ? `var(--mc-${row.agent.toLowerCase() === 'jarvis singh' ? 'primary' : 'blue'})` : 'var(--mc-faint)'} scale={0.8} />
                        <span className="text-[12px] text-mc-sub w-[90px] truncate">{row.agent ?? '—'}</span>
                        <Chip label={chip.label} bg={chip.bg} fg={chip.fg} h={20} />
                        {row.status === 'running' ? (
                          <span className="flex items-center gap-2 flex-1">
                            <Progress pct={row.progress} color="var(--mc-blue)" w="w-[100px]" />
                            <span className="text-[11.5px] text-mc-sub">{row.progress}%</span>
                          </span>
                        ) : (
                          <span className="flex-1" />
                        )}
                        <span className="text-[11.5px] text-mc-faint w-[90px] text-right">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )
                  })}
                </Card>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
