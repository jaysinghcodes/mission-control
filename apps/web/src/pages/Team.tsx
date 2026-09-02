import { useApi } from '../hooks/useApi'
import type { Agent, AgentsResp } from '../types'
import { Bot, Card, SectionLabel } from '../components/ui'
import { rosterDisplayName, rosterIdentity } from '../data/roster'

/**
 * Team (MC-201) — the roster as a *team*, not a list of processes.
 *
 * Org-chart header with Jarvis (Chief of Staff) on top and the rest of the
 * real OpenClaw roster as member cards below, fed by GET /agents (polled).
 * Nothing here is hardcoded: whoever the API reports is the team — Jarvis
 * (root, no parentId) becomes the org header, everyone else fills the roster
 * grid. Status dots keep the honest working/idle semantics of the old Agents
 * page; movement/stage logic lives in Office and is untouched.
 *
 * Identity display (MC-201): agent names + roles read through the approved
 * roster map (data/roster.ts) — Jarvis → Chief of Staff, Atlas → Scrum Master,
 * Nova → Development, … — so cards show human names and role titles. Unknown
 * agents render their real API name + role (fallback "agent" when role is
 * null). MC-200 profile fields (emoji, currentTask, …) are all optional on
 * the wire and every render path is null-safe.
 *
 * MC-202: each member card is a <button> so the profile drawer can attach a
 * click handler without markup churn (drawer + deep links land next ticket).
 * MC-211: Pixel's robot avatars replace the emoji/Bot glyph below.
 */

const statusColor = (status: string) => (status === 'working' ? 'var(--mc-green)' : 'var(--mc-faint)')

/** Avatar: agent.emoji when the bridge supplies it, else the colored Bot glyph. */
function Avatar({ agent, size = 1 }: { agent: Agent; size?: number }) {
  if (agent.emoji) {
    return (
      <span
        className="shrink-0 flex items-center justify-center rounded-md"
        style={{ width: 18 * size, height: 18 * size, fontSize: 12 * size, lineHeight: 1 }}
        aria-hidden
      >
        {agent.emoji}
      </span>
    )
  }
  return <Bot color={agent.color || 'var(--mc-primary)'} scale={size} />
}

/** Roster member card. Root (chief) variant gets the distinct org-header styling. */
function MemberCard({ agent, chief = false, parentName = null }: { agent: Agent; chief?: boolean; parentName?: string | null }) {
  // MC-202: add onClick here to open the agent profile drawer (name, tags,
  // current task, stats, channel deep link). Deliberately no-op for now.
  const identity = rosterIdentity(agent.name, agent.role)
  const name = rosterDisplayName(agent.name, agent.role)
  const roleTitle = identity?.role ?? agent.role ?? 'agent'
  const working = agent.status === 'working'

  if (chief) {
    return (
      <button
        type="button"
        aria-label={`${name} — ${roleTitle}`}
        className="rounded-xl bg-mc-card px-6 py-4 flex flex-col items-center gap-2 min-w-[220px] text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
        style={{ border: '1px solid color-mix(in srgb, var(--mc-primary) 55%, transparent)' }}
      >
        <Avatar agent={agent} size={1.9} />
        <div>
          <div className="text-[15px] font-semibold leading-tight">{name}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mc-primary">{roleTitle}</div>
        </div>
        <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: statusColor(agent.status) }} />
        <span className="text-[10px] text-mc-faint">{working ? 'working' : 'idle'}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={`${name} — ${roleTitle}${parentName ? `, reports to ${parentName}` : ''}`}
      className="rounded-xl border border-mc-border bg-mc-card px-3 py-2.5 min-w-[160px] w-[170px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
    >
      <div className="flex items-center gap-2">
        <Avatar agent={agent} size={1} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold leading-tight truncate">{name}</div>
          <div className="text-[11px] text-mc-sub truncate">{roleTitle}</div>
        </div>
        <span
          className="w-[4.5px] h-[4.5px] rounded-full shrink-0"
          title={working ? 'working' : 'idle'}
          style={{ backgroundColor: statusColor(agent.status) }}
        />
      </div>
      {parentName && <div className="mt-1 text-[10px] text-mc-faint truncate">↑ {parentName}</div>}
    </button>
  )
}

export default function Team() {
  const { data, error } = useApi<AgentsResp>('/agents', { pollMs: 30000 })
  const agents = data?.agents ?? []
  // Org root: the agent with no parent (Jarvis). Shape-tolerant: if the API
  // ever reports a roster without a root, the first agent leads instead.
  const chief = agents.find((a) => !a.parentId) ?? agents[0]
  const team = chief ? agents.filter((a) => a.id !== chief.id) : []
  const displayNameById = new Map(agents.map((a) => [a.id, rosterDisplayName(a.name, a.role)]))

  const workingCount = agents.filter((a) => a.status === 'working').length

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Team</div>
      <div className="mt-1 text-[13px] text-mc-sub">Meet the team — the real roster on this OpenClaw instance, who's working right now.</div>

      {error && (
        <Card className="mt-10 px-4 py-8 text-[12.5px] text-mc-faint">API unreachable — can't load the team roster.</Card>
      )}

      {!error && agents.length === 0 && (
        <Card className="mt-10 px-4 py-8 text-[12.5px] text-mc-faint">
          No roster synced yet. The bridge pushes the live agent tree every few minutes.
        </Card>
      )}

      {!error && chief && (
        <div className="mt-10 flex flex-col items-center">
          {/* Org-chart header — Jarvis (Chief of Staff) on top */}
          <MemberCard agent={chief} chief />
          {team.length === 0 ? (
            <div className="mt-8 text-[12px] text-mc-faint text-center max-w-sm">
              No sub-agents running right now. Spawn one (sessions_spawn or a task) and it appears here live.
            </div>
          ) : (
            <>
              {/* Connectors down to the team */}
              <div className="w-px h-7 bg-mc-faint/60" />
              <div className="h-px w-[min(900px,92%)] bg-mc-faint/60" />
              {/* Roster cards — one per live agent, any count */}
              <div className="mt-5 flex flex-wrap justify-center gap-3 max-w-[1060px]">
                {team.map((a) => {
                  const parent = a.parentId ? agents.find((p) => p.id === a.parentId) : null
                  const parentName = parent && parent.id !== chief.id ? displayNameById.get(parent.id) ?? null : null
                  return <MemberCard key={a.id} agent={a} parentName={parentName} />
                })}
              </div>
            </>
          )}
        </div>
      )}

      {!error && agents.length > 0 && (
        <Card className="mt-10 px-4 py-5 max-w-[520px]">
          <SectionLabel>Team Status</SectionLabel>
          <div className="flex gap-10 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-mc-green" />
              <span className="text-[12px] text-mc-sub">Working</span>
              <span className="text-[12px] font-semibold">{workingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-mc-faint" />
              <span className="text-[12px] text-mc-sub">Idle</span>
              <span className="text-[12px] font-semibold">{agents.length - workingCount}</span>
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
