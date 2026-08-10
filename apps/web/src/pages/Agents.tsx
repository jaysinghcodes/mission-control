import { useApi } from '../hooks/useApi'
import { Bot, Card, SectionLabel } from '../components/ui'

/**
 * Agents — the REAL OpenClaw roster (synced via agents.snapshot): Jarvis
 * Singh (main) on top, real sub-agents below, live status dots. Empty
 * sub-agent state explains how to spawn one.
 */

interface Agent { id: string; name: string; role: string | null; color: string; status: string; parentId: string | null }
interface AgentsResp { agents: Agent[] }

function AgentCard({ name, role, color, status }: { name: string; role: string | null; color: string; status: string }) {
  return (
    <Card className="px-3 py-2.5 relative w-[150px] h-[58px]">
      <div className="flex items-center gap-2">
        <Bot color={color} scale={1} />
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold leading-tight truncate">{name}</div>
          <div className="text-[11px] text-mc-sub truncate">{role ?? 'agent'}</div>
        </div>
      </div>
      <span
        className="absolute top-3.5 right-3 w-[4.5px] h-[4.5px] rounded-full"
        style={{ backgroundColor: status === 'working' ? 'var(--mc-green)' : 'var(--mc-faint)' }}
      />
    </Card>
  )
}

export default function Agents() {
  const { data, error } = useApi<AgentsResp>('/agents', { pollMs: 30000 })
  const agents = data?.agents ?? []
  const main = agents.find((a) => !a.parentId) ?? agents[0]
  const kids = agents.filter((a) => a.parentId || (main && a.id !== main.id))

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Agents</div>
      <div className="mt-1 text-[13px] text-mc-sub">The real roster on this OpenClaw instance — who's working right now.</div>

      {error && (
        <Card className="mt-10 px-4 py-8 text-[12.5px] text-mc-faint">API unreachable — can't load the agent roster.</Card>
      )}

      {!error && agents.length === 0 && (
        <Card className="mt-10 px-4 py-8 text-[12.5px] text-mc-faint">
          No roster synced yet. The bridge pushes the live agent tree every few minutes.
        </Card>
      )}

      {!error && main && (
        <div className="relative mt-10 h-[300px]">
          {/* main on top, kids below */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0">
            <AgentCard {...main} />
          </div>
          <div className="absolute left-1/2 top-[58px] w-px h-[80px] bg-mc-faint/60" />
          <div className="absolute left-[10%] right-[10%] top-[138px] h-px bg-mc-faint/60" />
          <div className="absolute inset-x-[10%] top-[162px] flex justify-around">
            {kids.length === 0 && (
              <div className="text-[12px] text-mc-faint text-center pt-4 max-w-sm">
                No sub-agents running right now. Spawn one (sessions_spawn or a task) and it appears here live.
              </div>
            )}
            {kids.map((k) => (
              <div key={k.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-mc-faint/60" />
                <AgentCard {...k} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!error && main && (
        <Card className="mt-10 px-4 py-5">
          <SectionLabel>Team Status</SectionLabel>
          <div className="flex gap-12 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-mc-green" />
              <span className="text-[12px] text-mc-sub">Working</span>
              <span className="text-[12px] font-semibold">{agents.filter((a) => a.status === 'working').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-mc-faint" />
              <span className="text-[12px] text-mc-sub">Idle</span>
              <span className="text-[12px] font-semibold">{agents.filter((a) => a.status !== 'working').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-mc-text" />
              <span className="text-[12px] text-mc-sub">Total agents</span>
              <span className="text-[12px] font-semibold">{agents.length}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
