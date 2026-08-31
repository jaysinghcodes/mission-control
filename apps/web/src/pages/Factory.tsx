import { useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useLiveActivity } from '../hooks/useLiveActivity'
import { Bot, Card, Chip, PillButton, SectionLabel } from '../components/ui'

/**
 * Factory — LIVE floor with REAL pipeline semantics (Jay fix #7).
 *
 * Stages (standard CI/CD definitions):
 *  BREAK ROOM — parts/queue (no active work)
 *  BUILD      — compile/assemble: code written, artifacts produced
 *  QA         — testing & verification: find bugs before release
 *  REVIEW     — human/peer review gate before anything ships
 *  SHIP       — release/deploy to production
 *
 * Agents are placed by role: build/infra/eng → BUILD, qa/test/audit → QA,
 * review → REVIEW, else round-robin. When a real run.* event fires, a bot
 * PHYSICALLY moves along the belt to its next stage while bobbing.
 */

interface Agent { id: string; name: string; role: string | null; color: string; status: string }
interface AgentsResp { agents: Agent[] }
interface EventApi { type: string; payload: { name?: string; summary?: string } | null; ts: string }
interface ActivityResp { events: EventApi[] }

const STATIONS = [
  { label: 'BREAK ROOM', kind: 'bin' as const, def: 'Parts & queue — no active work' },
  { label: 'BUILD', kind: 'machine' as const, def: 'Compile & assemble — code → artifacts' },
  { label: 'QA', kind: 'machine' as const, def: 'Test & verify — find bugs pre-release' },
  { label: 'REVIEW', kind: 'machine' as const, def: 'Human/peer review gate' },
  { label: 'SHIP', kind: 'machine' as const, def: 'Release & deploy to production' },
]
const STAGE_X = [2, 27, 45, 63, 81] // % left for each station

function stageForAgent(role: string | null, index: number): number {
  const r = (role ?? '').toLowerCase()
  if (r.includes('build') || r.includes('infra') || r.includes('eng') || r.includes('dev')) return 1 // BUILD
  if (r.includes('qa') || r.includes('test') || r.includes('audit') || r.includes('scan')) return 2 // QA
  if (r.includes('review') || r.includes('check')) return 3 // REVIEW
  return 1 + (index % 3) // round-robin across BUILD/QA/REVIEW
}

export default function Factory() {
  const agents = useApi<AgentsResp>('/agents', { pollMs: 30000 })
  const history = useApi<ActivityResp>('/activity?limit=30', { pollMs: 15000 })
  const { events } = useLiveActivity()

  // agentId → station index. Recompute when the roster changes.
  const [stations, setStations] = useState<Record<string, number>>({})
  const [transit, setTransit] = useState<{ id: string; from: number; to: number } | null>(null)
  const prevRoster = useRef('')

  const roster = agents.data?.agents ?? []
  const rosterKey = roster.map((a) => `${a.id}:${a.status}`).join('|')

  useEffect(() => {
    if (rosterKey !== prevRoster.current) {
      prevRoster.current = rosterKey
      const next: Record<string, number> = {}
      roster.forEach((a, i) => {
        next[a.id] = stageForAgent(a.role, i)
      })
      setStations(next)
    }
  }, [rosterKey, roster])

  // On run.* events: move a bot to the stage matching the event.
  useEffect(() => {
    const runEvents = events.filter((e) => e.type.startsWith('run.'))
    if (runEvents.length === 0 || Object.keys(stations).length === 0) return
    const ev = runEvents[0]
    const target = ev.type === 'run.completed' ? 4 : ev.type === 'run.failed' ? 2 : ev.type === 'run.queued' ? 1 : 1 + (ev.type === 'run.progress' ? 1 : 0)
    const candidates = roster.filter((a) => a.status === 'working' || a.status !== 'idle')
    const mover = candidates[0] ?? roster[0]
    if (!mover) return
    const from = stations[mover.id] ?? 1
    const to = Math.min(Math.max(target, 1), 4)
    if (from === to) return
    setStations((s) => ({ ...s, [mover.id]: to }))
    setTransit({ id: mover.id, from, to })
    const t = setTimeout(() => setTransit(null), 3000)
    return () => clearTimeout(t)
  }, [events, roster, stations])

  const working = roster.filter((a) => a.status === 'working')
  const idle = roster.filter((a) => a.status !== 'working')

  const buildLog = useMemo(() => {
    const runEvents = (history.data?.events ?? []).filter((e) => e.type.startsWith('run.'))
    return runEvents.slice(0, 6).map((e) => ({
      tm: new Date(e.ts).toLocaleTimeString([], { hour12: false }),
      agent: 'jarvis',
      msg: `${e.type}${e.payload?.name ? ' · ' + e.payload.name : ''}`,
      color: e.type.includes('fail') ? 'var(--mc-redtext)' : e.type.includes('complete') ? 'var(--mc-greentext)' : 'var(--mc-bluetext)',
    }))
  }, [history.data])

  const stats = [
    { label: 'Working', value: String(working.length) },
    { label: 'Idle', value: String(idle.length) },
    { label: 'Agents', value: String(roster.length) },
    { label: 'Live Events', value: String(events.length) },
  ]

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Factory</div>
          <div className="mt-1 text-[13px] text-mc-sub">Build → QA → Review → Ship — agents physically move between stages.</div>
        </div>
        <div className="flex items-center gap-2">
          {['1x', '2x', '4x'].map((sp, i) => (
            <PillButton key={sp} label={sp} on={i === 0} className="w-[38px] px-0" />
          ))}
          <PillButton label="❚❚  Pause" className="ml-2" />
        </div>
      </div>

      <div className="relative mt-6 h-[400px] rounded-2xl border border-mc-border bg-mc-inner overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(var(--mc-border) 1px, transparent 1px), linear-gradient(90deg, var(--mc-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-3 left-4 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mc-faint">
          FLOOR 01 · LIVE <span className="ml-2 inline-block w-2 h-2 rounded-full bg-mc-green align-middle" />
        </div>
        <div className="absolute top-3 right-4 h-[22px] px-3 rounded-md bg-mc-primary text-white text-[10.5px] font-semibold flex items-center">
          ANDON · {events.filter((e) => e.type.includes('fail')).length}
        </div>

        <div className="absolute left-5 right-5 top-14 h-0.5 bg-mc-faint/40" />

        {/* Stations — one BREAK ROOM bin + BUILD/QA/REVIEW/SHIP machines */}
        <div className="absolute inset-x-4 top-[88px] flex justify-between">
          {STATIONS.map((st) => (
            <div key={st.label} className="flex flex-col items-center w-[100px]" title={st.def}>
              {st.kind === 'machine' ? (
                <>
                  <div className="w-[5px] h-[26px] bg-mc-faint/60" />
                  <div className="w-[100px] h-[56px] rounded-lg bg-mc-card border border-mc-border flex flex-col items-center justify-center">
                    <div className="text-[10.5px] font-semibold">{st.label}</div>
                    <div className="text-[8.5px] text-mc-faint uppercase tracking-wide mt-0.5 px-1 text-center">{st.def.split('—')[1] ?? ''}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-[60px] h-[44px] rounded-lg bg-mc-card border border-mc-border flex flex-col items-center justify-center gap-1.5">
                    <div className="flex gap-1.5">
                      <span className="w-[10px] h-[8px] rounded bg-mc-ralph" />
                      <span className="w-[10px] h-[8px] rounded bg-mc-charlie" />
                      <span className="w-[10px] h-[8px] rounded bg-mc-faint" />
                    </div>
                    <div className="text-[9px] font-semibold text-mc-sub">PARTS</div>
                  </div>
                  <div className="mt-3 text-[10.5px] font-semibold text-mc-sub">{st.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* conveyor belt */}
        <div className="absolute left-10 right-10 top-[200px] h-[14px] rounded-full bg-mc-track border border-mc-border flex items-center overflow-hidden">
          <div className="absolute inset-y-0 left-0 flex items-center" style={{ animation: 'belt 8s linear infinite' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="w-[10px] h-[10px] rounded-[2.5px] mx-4 bg-mc-blue/70" />
            ))}
          </div>
        </div>

        {/* Agents at stations — bobbing while working, physically moving on events */}
        <div className="absolute inset-x-4 top-[230px] h-[110px]">
          {roster.map((a) => {
            const st = stations[a.id] ?? 1
            const x = STAGE_X[st]
            const isWorking = a.status === 'working'
            const isTransiting = transit?.id === a.id
            return (
              <div
                key={a.id}
                className="absolute flex flex-col items-center -translate-x-1/2"
                style={{ left: `${x}%`, transition: 'left 2.5s ease-in-out' }}
              >
                <div className={isTransiting ? 'animate-bob' : isWorking ? 'animate-bob' : ''} style={isTransiting ? { animationDuration: '0.6s' } : { animationDuration: '1.4s' }}>
                  <Bot color={a.color} scale={1.1} />
                </div>
                <div className="mt-1 text-[11px] font-semibold truncate max-w-[110px]">{a.name}</div>
                <div className="text-[9px] text-mc-sub truncate max-w-[110px]">{a.role ?? 'agent'}</div>
                {isTransiting && (
                  <Chip label={`→ ${STATIONS[transit!.to].label}`} bg="var(--mc-greenbg)" fg="var(--mc-greentext)" h={16} fs="text-[8.5px]" className="mt-1" />
                )}
                {!isTransiting && (
                  <Chip
                    label={isWorking ? 'WORKING' : 'IDLE'}
                    bg={isWorking ? 'var(--mc-bluebg)' : 'var(--mc-inner)'}
                    fg={isWorking ? 'var(--mc-bluetext)' : 'var(--mc-faint)'}
                    h={16}
                    fs="text-[8.5px]"
                    className="mt-1"
                  />
                )}
              </div>
            )
          })}
          {roster.length === 0 && (
            <div className="text-[12px] text-mc-faint pt-6 text-center">No agents synced yet — the bridge pushes the roster every few minutes.</div>
          )}
        </div>

        {/* floor stats */}
        <div className="absolute bottom-4 inset-x-4 flex justify-between px-1">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[16px] font-semibold">{s.value}</div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-mc-faint">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Build log — real persisted run events */}
      <Card className="mt-6 px-4 py-3">
        <SectionLabel>Build Log</SectionLabel>
        <div className="mt-2">
          {buildLog.length === 0 && <div className="text-[12px] text-mc-faint py-2">No run events yet — they stream in live.</div>}
          {buildLog.map((l, i) => (
            <div key={i} className="flex items-center gap-2 py-[5px] font-mono text-[11px]">
              <span className="text-mc-faint">{l.tm}</span>
              <span className="font-semibold text-mc-text">{l.agent}</span>
              <span style={{ color: l.color }}>{l.msg}</span>
            </div>
          ))}
        </div>
      </Card>

      <style>{`@keyframes belt { from { transform: translateX(0); } to { transform: translateX(-240px); } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bob { animation: bob 1.4s ease-in-out infinite; }`}</style>
    </div>
  )
}
