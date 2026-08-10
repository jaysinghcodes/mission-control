import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useLiveActivity } from '../hooks/useLiveActivity'
import { Bot, Card, Chip, PillButton, SectionLabel } from '../components/ui'

/**
 * Factory — LIVE floor. Real agents from the API bob at their stations when
 * working; when run.* events arrive the bot animates a move across the belt
 * to the next station. Build log = real activity events.
 */

interface Agent { id: string; name: string; role: string | null; color: string; status: string }
interface AgentsResp { agents: Agent[] }
interface ActivityEventApi { type: string; payload: { name?: string; summary?: string } | null; ts: string }
interface ActivityResp { events: ActivityEventApi[] }

const STATIONS = [
  { label: 'BUILD', kind: 'bin' as const },
  { label: 'BUILD', kind: 'machine' as const },
  { label: 'QA', kind: 'machine' as const },
  { label: 'REVIEW', kind: 'machine' as const },
  { label: 'SHIP', kind: 'machine' as const },
]

export default function Factory() {
  const agents = useApi<AgentsResp>('/agents', { pollMs: 30000 })
  const history = useApi<ActivityResp>('/activity?limit=20', { pollMs: 15000 })
  const { events } = useLiveActivity()
  const [moving, setMoving] = useState<Record<string, number>>({}) // agentId -> station index

  // Animate a move when a run event arrives: bot travels toward next station.
  useEffect(() => {
    const runEvents = events.filter((e) => e.type.startsWith('run.'))
    if (runEvents.length === 0) return
    const latest = runEvents[0]
    const station = Math.floor(Math.random() * 3) + 1 // BUILD→QA→REVIEW range
    const id = `${latest.ts}-${station}`
    setMoving((m) => ({ ...m, [id]: station }))
    const t = setTimeout(() => setMoving((m) => {
      const next = { ...m }
      delete next[id]
      return next
    }), 4000)
    return () => clearTimeout(t)
  }, [events])

  const roster = agents.data?.agents ?? []
  const working = roster.filter((a) => a.status === 'working')
  const idle = roster.filter((a) => a.status !== 'working')

  const buildLog: { tm: string; agent: string; msg: string; color: string }[] = [
    ...(history.data?.events ?? [])
      .filter((e) => e.type.startsWith('run.'))
      .slice(0, 6)
      .map((e) => ({
        tm: new Date(e.ts).toLocaleTimeString([], { hour12: false }),
        agent: 'jarvis',
        msg: `${e.type}${e.payload?.name ? ' · ' + e.payload.name : ''}`,
        color: e.type.includes('fail') ? 'var(--mc-redtext)' : e.type.includes('complete') ? 'var(--mc-greentext)' : 'var(--mc-bluetext)',
      })),
  ]

  const stats = [
    { label: 'Active Bots', value: String(working.length) },
    { label: 'Idle', value: String(idle.length) },
    { label: 'Total Agents', value: String(roster.length) },
    { label: 'Live Events', value: String(events.length) },
  ]

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Factory</div>
          <div className="mt-1 text-[13px] text-mc-sub">Live floor — your agents bobbing at stations, moving on real events.</div>
        </div>
        <div className="flex items-center gap-2">
          {['1x', '2x', '4x'].map((sp, i) => (
            <PillButton key={sp} label={sp} on={i === 0} className="w-[38px] px-0" />
          ))}
          <PillButton label="❚❚  Pause" className="ml-2" />
        </div>
      </div>

      <div className="relative mt-6 h-[380px] rounded-2xl border border-mc-border bg-mc-inner overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(var(--mc-border) 1px, transparent 1px), linear-gradient(90deg, var(--mc-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-3 left-4 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mc-faint">
          FLOOR 01 · LIVE <span className="ml-2 inline-block w-2 h-2 rounded-full bg-mc-green align-middle" />
        </div>
        <div className="absolute top-3 right-4 h-[22px] px-3 rounded-md bg-mc-primary text-white text-[10.5px] font-semibold flex items-center">
          ANDON · {events.filter((e) => e.type.includes('fail')).length}
        </div>

        <div className="absolute left-5 right-5 top-14 h-0.5 bg-mc-faint/40" />

        {/* stations */}
        <div className="absolute inset-x-4 top-[88px] flex justify-between">
          {STATIONS.map((st, si) => (
            <div key={si} className="flex flex-col items-center w-[100px]">
              <div className="w-[5px] h-[26px] bg-mc-faint/60" />
              <div className="w-[100px] h-[56px] rounded-lg bg-mc-card border border-mc-border flex items-center justify-center text-[10.5px] font-semibold text-mc-sub">
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* conveyor belt */}
        <div className="absolute left-10 right-10 top-[196px] h-[14px] rounded-full bg-mc-track border border-mc-border flex items-center overflow-hidden">
          <div className="absolute inset-y-0 left-0 flex items-center" style={{ animation: 'belt 8s linear infinite' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="w-[10px] h-[10px] rounded-[2.5px] mx-4 bg-mc-blue/70" />
            ))}
          </div>
        </div>

        {/* working bots — bobbing at stations (Jay's feedback) */}
        <div className="absolute inset-x-4 top-[220px] flex justify-between px-2">
          {Array.from({ length: 5 }).map((_, si) => {
            const bot = working[si % Math.max(working.length, 1)]
            return bot ? (
              <div key={si} className="flex flex-col items-center w-[110px]">
                <div className={bot.status === 'working' ? 'animate-bob' : ''} style={{ animationDuration: '1.4s' }}>
                  <Bot color={bot.color} scale={1.1} />
                </div>
                <div className="mt-1 text-[11px] font-semibold truncate w-full text-center">{bot.name}</div>
                <div className="text-[9.5px] text-mc-sub truncate w-full text-center">{bot.role ?? 'agent'}</div>
                <Chip label="WORKING" bg="var(--mc-bluebg)" fg="var(--mc-bluetext)" h={16} fs="text-[8.5px]" className="mt-1" />
              </div>
            ) : (
              <div key={si} className="flex flex-col items-center w-[110px]">
                <Bot color="var(--mc-faint)" scale={1.1} />
                <Chip label="IDLE" bg="var(--mc-inner)" fg="var(--mc-faint)" h={16} fs="text-[8.5px]" className="mt-2" />
              </div>
            )
          })}
        </div>

        {/* moving bots on the belt (real event triggered) */}
        {Object.entries(moving).map(([id, station]) => (
          <div key={id} className="absolute top-[206px] flex flex-col items-center" style={{ left: `${10 + station * 20}%`, transition: 'left 3s ease-in-out', animation: 'belt 3s ease-in-out' }}>
            <Bot color="var(--mc-green)" scale={1} />
            <Chip label="→ MOVING" bg="var(--mc-greenbg)" fg="var(--mc-greentext)" h={16} fs="text-[8.5px]" />
          </div>
        ))}

        {/* floor stats */}
        <div className="absolute bottom-5 inset-x-4 flex justify-between px-1">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[16px] font-semibold">{s.value}</div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-mc-faint">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Build log — real activity events */}
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
