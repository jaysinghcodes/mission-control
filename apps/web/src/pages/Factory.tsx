import { FACTORY_BOTS, FACTORY_LOG, FACTORY_STATS, FACTORY_TRANSIT } from '../data/mock'
import { Bot, Card, Chip, PillButton, SectionLabel } from '../components/ui'

/**
 * Factory (wireframe 07) — live factory floor: stations, conveyor belt with
 * agents in transit, stack lights, and a build log. Playful but informative.
 */
const STATIONS = [
  { label: 'BREAK ROOM', color: '#8A939E', screen: 'PARTS', kind: 'bin' },
  { label: 'BUILD', color: 'var(--mc-purple)', screen: 'RUN · 62%', kind: 'machine', light: 'var(--mc-purple)' },
  { label: 'QA', color: 'var(--mc-orange)', screen: 'TEST · 34%', kind: 'machine', light: 'var(--mc-orange)' },
  { label: 'REVIEW', color: 'var(--mc-blue)', screen: 'REV · 40%', kind: 'machine', light: 'var(--mc-blue)' },
  { label: 'SHIP', color: 'var(--mc-green)', screen: 'DONE', kind: 'machine', light: 'var(--mc-green)' },
] as const

export default function Factory() {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[22px] font-semibold">Factory</div>
          <div className="mt-1 text-[13px] text-mc-sub">Live view — your agents moving between stations, building for real.</div>
        </div>
        <div className="flex items-center gap-2">
          {['1x', '2x', '4x'].map((sp, i) => (
            <PillButton key={sp} label={sp} on={i === 0} className="w-[38px] px-0" />
          ))}
          <PillButton label="❚❚  Pause" className="ml-2" />
        </div>
      </div>

      {/* Factory floor */}
      <div className="relative mt-6 h-[400px] rounded-2xl border border-mc-border bg-mc-inner overflow-hidden">
        {/* grid */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(var(--mc-border) 1px, transparent 1px), linear-gradient(90deg, var(--mc-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-3 left-4 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mc-faint">
          FLOOR 01 · LIVE <span className="ml-2 inline-block w-2 h-2 rounded-full bg-mc-green align-middle" />
        </div>
        <div className="absolute top-3 right-4 h-[22px] px-3 rounded-md bg-mc-primary text-white text-[10.5px] font-semibold flex items-center">
          ANDON · 0
        </div>

        {/* gantry beam */}
        <div className="absolute left-5 right-5 top-14 h-0.5 bg-mc-faint/40" />

        {/* stations */}
        <div className="absolute inset-x-4 top-[88px] flex justify-between">
          {STATIONS.map((st) => (
            <div key={st.label} className="flex flex-col items-center w-[88px]">
              {st.kind === 'machine' && (
                <>
                  {/* stack light */}
                  <div className="w-[5px] h-[26px] bg-mc-faint/60" />
                  <div className="flex flex-col items-center gap-[6px] -mt-[16px] mb-[10px]">
                    <span className="w-[7px] h-[7px] rounded-full bg-mc-red opacity-30" />
                    <span className="w-[7px] h-[7px] rounded-full bg-mc-orange opacity-30" />
                    <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: st.light }} />
                  </div>
                  {/* machine */}
                  <div className="w-[88px] h-[56px] rounded-lg bg-mc-card border border-mc-border flex flex-col items-center justify-center gap-1">
                    <div className="w-[64px] h-[18px] rounded bg-mc-inner border border-mc-border flex items-center justify-center text-[10px] font-semibold" style={{ color: 'var(--mc-text)' }}>
                      {st.screen}
                    </div>
                    <div className="text-[10.5px] font-semibold text-mc-sub">{st.label}</div>
                  </div>
                </>
              )}
              {st.kind === 'bin' && (
                <>
                  <div className="w-[60px] h-[44px] rounded-lg bg-mc-inner border border-mc-border flex flex-col items-center justify-center gap-1.5">
                    <div className="flex gap-1.5">
                      <span className="w-[10px] h-[8px] rounded bg-mc-ralph" />
                      <span className="w-[10px] h-[8px] rounded bg-mc-charlie" />
                      <span className="w-[10px] h-[8px] rounded bg-mc-faint" />
                    </div>
                    <div className="text-[9.5px] font-semibold text-mc-sub">PARTS</div>
                  </div>
                  <div className="mt-3 text-[10.5px] font-semibold text-mc-sub">{st.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* conveyor belt */}
        <div className="absolute left-10 right-10 top-[196px] h-[14px] rounded-full bg-mc-track border border-mc-border flex items-center overflow-hidden">
          <div className="absolute inset-y-0 left-0 flex items-center" style={{ animation: 'belt 8s linear infinite' }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="w-[10px] h-[10px] rounded-[2.5px] mx-4" style={{ backgroundColor: ['var(--mc-ralph)', 'var(--mc-charlie)', 'var(--mc-henry)', 'var(--mc-scout)'][i % 4], opacity: 0.9 }} />
            ))}
          </div>
        </div>
        <div className="absolute right-10 top-[192px] text-[11px] text-mc-faint">▸</div>

        {/* working bots at stations */}
        <div className="absolute inset-x-4 top-[220px] flex justify-between px-2">
          {FACTORY_BOTS.map((b) => (
            <div key={b.name} className="flex flex-col items-center w-[100px]">
              <Bot color={b.color} scale={1.1} />
              <div className="mt-1 text-[11px] font-semibold">{b.name}</div>
              <div className="text-[9.5px] text-mc-sub truncate w-full text-center">{b.task}</div>
              <Chip label={b.status === 'working' ? 'WORKING' : 'IDLE'} bg={b.status === 'working' ? 'var(--mc-bluebg)' : 'var(--mc-inner)'} fg={b.status === 'working' ? 'var(--mc-bluetext)' : 'var(--mc-faint)'} h={16} fs="text-[8.5px]" className="mt-1" />
            </div>
          ))}
        </div>

        {/* agents in transit */}
        <div className="absolute left-[34%] -top-1">
          <div className="flex flex-col items-center">
            <div className="text-[10.5px] font-semibold">{FACTORY_TRANSIT[0].name}</div>
            <Chip label={FACTORY_TRANSIT[0].chip} bg={FACTORY_TRANSIT[0].chipBg} fg={FACTORY_TRANSIT[0].chipFg} h={16} fs="text-[9px]" />
            <Bot color={FACTORY_TRANSIT[0].color} scale={1} />
          </div>
        </div>
        <div className="absolute left-[54%] top-2">
          <div className="flex flex-col items-center">
            <div className="text-[10.5px] font-semibold">{FACTORY_TRANSIT[1].name}</div>
            <Chip label={FACTORY_TRANSIT[1].chip} bg={FACTORY_TRANSIT[1].chipBg} fg={FACTORY_TRANSIT[1].chipFg} h={16} fs="text-[9px]" />
            <Bot color={FACTORY_TRANSIT[1].color} scale={1} />
          </div>
        </div>

        {/* safety stripes */}
        <div className="absolute bottom-2 left-3 right-3 h-[5px] flex overflow-hidden rounded">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="flex-1" style={{ backgroundColor: i % 2 === 0 ? 'var(--mc-yellow)' : 'var(--mc-bg)' }} />
          ))}
        </div>

        {/* floor stats */}
        <div className="absolute bottom-5 inset-x-4 flex justify-between px-1">
          {FACTORY_STATS.map((s) => (
            <div key={s.label}>
              <div className="text-[16px] font-semibold">{s.value}</div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-mc-faint">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Build log */}
      <Card className="mt-6 px-4 py-3">
        <SectionLabel>Build Log</SectionLabel>
        <div className="mt-2">
          {FACTORY_LOG.map((l) => (
            <div key={l.tm + l.msg} className="flex items-center gap-2 py-[5px] font-mono text-[11px]">
              <span className="text-mc-faint">{l.tm}</span>
              <span className="font-semibold text-mc-text">{l.agent}</span>
              <span className="text-mc-sub">{l.msg}</span>
            </div>
          ))}
        </div>
      </Card>

      <style>{`@keyframes belt { from { transform: translateX(0); } to { transform: translateX(-240px); } }`}</style>
    </div>
  )
}
