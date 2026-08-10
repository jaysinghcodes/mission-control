import { AGENT_KIDS, AGENT_MAIN, AGENT_PARENTS, TEAM_STATUS } from '../data/mock'
import { Bot, Card, SectionLabel } from '../components/ui'

/**
 * Agents (wireframe 02) — family tree: main → 3 leads → 6 sub-agents,
 * light tree lines (GLM: #94A3B8 / 1.2px feel), TEAM STATUS panel.
 */
function AgentCard({ name, role, color, status, sub }: { name: string; role: string; color: string; status: string; sub?: string }) {
  return (
    <Card className="px-3 py-2.5 relative w-[140px] h-[58px]">
      <div className="flex items-center gap-2">
        <Bot color={color} scale={1} />
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold leading-tight">{name}</div>
          <div className="text-[11px] text-mc-sub truncate">{role}</div>
        </div>
      </div>
      <span
        className="absolute top-3.5 right-3 w-[4.5px] h-[4.5px] rounded-full"
        style={{ backgroundColor: status === 'working' ? 'var(--mc-green)' : 'var(--mc-faint)' }}
      />
      {sub && <div className="mt-1.5 text-[10.5px] text-mc-faint">{sub}</div>}
    </Card>
  )
}

function VLine({ top, bottom, left }: { top: number; bottom: number; left: string | number }) {
  return <div className="absolute w-px bg-mc-faint/60" style={{ top, bottom, left }} />
}
function HLine({ left, right, top }: { left: string | number; right: string | number; top: number }) {
  return <div className="absolute h-px bg-mc-faint/60" style={{ left, right, top }} />
}

export default function Agents() {
  // Container-relative layout: main centered, 3 leads below, 6 kids at the bottom row.
  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Agents</div>
      <div className="mt-1 text-[13px] text-mc-sub">Your team hierarchy — who reports to whom, and what they're doing.</div>

      <div className="relative mt-10 h-[340px]">
        {/* main → leads */}
        <VLine top={62} bottom={118} left="50%" />
        <HLine top={118} left="25%" right="75%" />
        {[0, 1, 2].map((i) => (
          <VLine key={i} top={118} bottom={158} left={`${25 + i * 25}%`} />
        ))}
        {/* leads → kids */}
        {[0, 1, 2].map((i) => (
          <VLine key={i} top={196} bottom={238} left={`${25 + i * 25}%`} />
        ))}
        <HLine top={238} left="12.5%" right="87.5%" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <VLine key={i} top={238} bottom={262} left={`${12.5 + i * 15}%`} />
        ))}

        {/* main */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <AgentCard {...AGENT_MAIN} />
        </div>
        {/* leads */}
        <div className="absolute inset-x-0 top-[158px] flex justify-between px-[3%]">
          {AGENT_PARENTS.map((a) => (
            <AgentCard key={a.name} {...a} />
          ))}
        </div>
        {/* kids */}
        <div className="absolute inset-x-0 top-[262px] flex justify-between px-[1%]">
          {AGENT_KIDS.map((a) => (
            <AgentCard key={a.name} {...a} />
          ))}
        </div>
      </div>

      <Card className="mt-10 px-4 py-5">
        <SectionLabel>Team Status</SectionLabel>
        <div className="flex gap-12 mt-4">
          {TEAM_STATUS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[12px] text-mc-sub">{s.label}</span>
              {s.value && <span className="text-[12px] font-semibold text-mc-text">{s.value}</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
