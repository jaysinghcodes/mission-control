import { useLiveActivity } from '../hooks/useLiveActivity'
import { OVERVIEW_APPROVALS, OVERVIEW_ACTIVITY, OVERVIEW_KPIS } from '../data/mock'
import { Bot, KpiCard, PillButton, SectionLabel } from '../components/ui'

/**
 * Overview (wireframe 00) — hero greeting, KPI tiles (carded per GLM MUST-4),
 * Live Activity band (real socket events, wireframe rows as fallback) and
 * Approvals Needed with Review CTAs.
 */
export default function Overview() {
  const { events, connected } = useLiveActivity()

  const activity =
    events.length > 0
      ? events.slice(0, 5).map((ev) => {
          const payload = ev.payload
          const name = payload && typeof payload === 'object' && 'name' in payload ? String(payload.name) : ''
          return {
            agent: ev.type === 'health.tick' ? 'system' : 'openclaw',
            color: ev.type === 'run.failed' ? 'var(--mc-red)' : ev.type === 'run.completed' ? 'var(--mc-green)' : 'var(--mc-blue)',
            action: `${ev.type}${name ? ' · ' + name : ''}`,
          }
        })
      : OVERVIEW_ACTIVITY

  return (
    <div className="p-6">
      <div className="text-[34px] font-semibold leading-tight">Good evening, Jay</div>
      <div className="mt-1 text-[14.5px] text-mc-sub">Your agents are at work. Here's the state of things.</div>

      {/* KPI tiles — cards required (GLM MUST-4) */}
      <div className="grid grid-cols-4 gap-5 mt-8">
        {OVERVIEW_KPIS.map((kpi) => (
          <KpiCard key={kpi.label} value={kpi.value} label={kpi.label} />
        ))}
      </div>

      <div className="mt-8 h-px bg-mc-border2" />

      <div className="grid grid-cols-2 gap-10 mt-8">
        {/* Live Activity band */}
        <div>
          <SectionLabel>Live Activity</SectionLabel>
          <div className="mt-4">
            {activity.map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-[13px] border-b border-mc-border2">
                <Bot color={row.color} scale={1} />
                <span className="text-[13px] font-semibold">{row.agent}</span>
                <span className="text-[12.5px] text-mc-sub truncate">{row.action}</span>
              </div>
            ))}
            <div className="mt-3 text-[12px] text-mc-faint">
              {connected ? '…streaming live' : '● offline — showing wireframe rows'}
            </div>
          </div>
        </div>

        {/* Approvals needed */}
        <div>
          <SectionLabel>Approvals Needed</SectionLabel>
          <div className="mt-4">
            {OVERVIEW_APPROVALS.map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-[13px] border-b border-mc-border2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                <span className="text-[12.5px] font-medium flex-1 truncate">{row.desc}</span>
                <PillButton label="Review" on className="h-7 px-4 text-[12px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
