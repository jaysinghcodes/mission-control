import { ACTIVITY_EVENTS, ACTIVITY_ZONES, agentColor } from '../data/mock'
import { useLiveActivity } from '../hooks/useLiveActivity'
import { Bot, Card, Chip, PillButton, SectionLabel } from '../components/ui'

/**
 * Live Activity (wireframe 08) — zone cards (Build/QA/Research/Content) plus
 * the full event stream. Real socket events flow in when connected; the
 * wireframe stream is the fallback.
 */
export default function Activity() {
  const { events, connected } = useLiveActivity()

  const stream =
    events.length > 0
      ? events.slice(0, 8).map((ev, i) => {
          const payload = ev.payload
          const name = payload && typeof payload === 'object' && 'name' in payload ? String(payload.name) : ''
          return {
            tm: new Date(ev.ts).toLocaleTimeString([], { hour12: false }),
            agent: 'openclaw',
            color: agentColor('main'),
            zone: String(ev.type).split('.')[0]?.toUpperCase() ?? 'RUN',
            desc: `${ev.type}${name ? ' · ' + name : ''}`,
            accent: 'var(--mc-bluetext)',
            key: `${ev.ts}-${i}`,
          }
        })
      : ACTIVITY_EVENTS.map((e) => ({ ...e, key: e.tm + e.desc }))

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Live Activity</div>
          <div className="mt-1 text-[13px] text-mc-sub">Where your agents are working right now — zone by zone.</div>
        </div>
        <PillButton label="❚❚  Pause" />
      </div>

      {/* Zone cards */}
      <div className="flex gap-3 mt-6">
        {ACTIVITY_ZONES.map((z) => (
          <Card key={z.name} className="w-[186px] shrink-0 px-3 py-3">
            <SectionLabel>{z.name}</SectionLabel>
            <div className="mt-3 space-y-3">
              {z.agents.map((a) => (
                <div key={a.name} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot color={a.color} scale={0.9} />
                      <span className="text-[12px] font-semibold">{a.name}</span>
                    </div>
                    <div className="text-[10.5px] text-mc-sub truncate mt-1">{a.task}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-mc-green mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Event stream */}
      <SectionLabel className="mt-8">Event Stream</SectionLabel>
      <Card className="mt-3 rounded-2xl px-0 py-1 overflow-hidden">
        {stream.map((ev) => (
          <div key={ev.key} className="flex items-center gap-3 px-[18px] h-11 border-b border-mc-border2">
            <span className="font-mono text-[11.5px] text-mc-faint w-[70px]">{ev.tm}</span>
            <Bot color={ev.color} scale={0.85} />
            <span className="text-[12px] font-semibold w-[70px]">{ev.agent}</span>
            <Chip label={ev.zone} bg="var(--mc-inner)" fg="var(--mc-sub)" h={17} fs="text-[9.5px]" />
            <span className="text-[12px] text-mc-sub truncate">{ev.desc}</span>
          </div>
        ))}
        <div className="px-[18px] py-3 text-[12px] font-semibold text-mc-greentext">
          {connected ? '● Streaming live' : '● offline — showing wireframe stream'}
        </div>
      </Card>
    </div>
  )
}
