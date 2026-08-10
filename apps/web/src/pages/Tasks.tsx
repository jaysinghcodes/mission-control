import { TASK_GROUPS, agentColor } from '../data/mock'
import { Bot, Card, Chip, Progress } from '../components/ui'

/**
 * Tasks (wireframe 01) — In Flight / Queued / Done Today groups.
 * Running rows show a live progress bar; queued/done show status chips.
 */
const STATUS_CHIP = {
  running: { bg: 'var(--mc-bluebg)', fg: 'var(--mc-bluetext)', label: 'RUNNING' },
  queued: { bg: 'var(--mc-orangebg)', fg: 'var(--mc-orangetext)', label: 'QUEUED' },
  done: { bg: 'var(--mc-greenbg)', fg: 'var(--mc-greentext)', label: 'DONE' },
} as const

export default function Tasks() {
  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Tasks</div>
      <div className="mt-1 text-[13px] text-mc-sub">What's in flight, queued, and done today — at a glance.</div>

      <div className="mt-8 space-y-8">
        {TASK_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mc-faint mb-2.5">{group.title}</div>
            <Card className="px-0 py-1">
              {group.rows.map((row, i) => {
                const chip = STATUS_CHIP[row.status]
                return (
                  <div
                    key={row.name}
                    className={`flex items-center gap-4 px-4 h-[50px] ${i < group.rows.length - 1 ? 'border-b border-mc-border2' : ''}`}
                  >
                    <span className="text-[13px] font-medium w-[300px] truncate">{row.name}</span>
                    <Bot color={agentColor(row.agent)} scale={0.8} />
                    <span className="text-[12px] text-mc-sub w-[90px]">{row.agent}</span>
                    <Chip label={chip.label} bg={chip.bg} fg={chip.fg} h={20} />
                    {row.status === 'running' ? (
                      <span className="flex items-center gap-2 flex-1">
                        <Progress pct={row.prog} color="var(--mc-blue)" w="w-[100px]" />
                        <span className="text-[11.5px] text-mc-sub">{row.prog}%</span>
                      </span>
                    ) : (
                      <span className="flex-1" />
                    )}
                    <span className="text-[11.5px] text-mc-faint w-[50px] text-right">{row.started}</span>
                    <span className="text-[11.5px] text-mc-faint w-[50px] text-right">{row.dur}</span>
                  </div>
                )
              })}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
