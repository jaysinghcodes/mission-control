import { CALENDAR_EVENTS, CALENDAR_LEGEND } from '../data/mock'
import { Card } from '../components/ui'

/**
 * Calendar (wireframe 05) — "Scheduled Tasks" weekly grid of cron routines.
 * Events are colored blocks positioned in day columns / time rows.
 */
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function Calendar() {
  const rows = 4 // 4 time rows (wireframe: rowh = (gh-40)/4)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[22px] font-semibold">Scheduled Tasks</div>
          <div className="mt-1 text-[13px] text-mc-sub">Cron jobs and recurring routines, weekly view.</div>
        </div>
        <div className="flex items-center gap-4 text-mc-sub">
          <button type="button" className="text-[22px] leading-none hover:text-mc-text">‹</button>
          <span className="text-[16px] font-semibold text-mc-text">August 2026</span>
          <button type="button" className="text-[22px] leading-none hover:text-mc-text">›</button>
        </div>
      </div>

      <Card className="mt-6 rounded-2xl px-0 py-0 relative h-[440px] overflow-hidden">
        {/* day headers + column dividers */}
        <div className="flex h-8 items-end px-4 pb-1.5">
          {DAYS.map((d, i) => (
            <div key={d} className={`flex-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-mc-faint ${i > 0 ? 'pl-2' : ''}`}>
              {d}
            </div>
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="absolute top-2 bottom-2 w-px bg-mc-border2" style={{ left: `${(i / 7) * 100}%` }} />
        ))}

        {/* event blocks: positioned by day column + row slot */}
        {CALENDAR_EVENTS.map((ev) => (
          <div
            key={ev.label + ev.time}
            className="absolute rounded-lg px-2 py-1 overflow-hidden"
            style={{
              left: `calc(${(ev.col / 7) * 100}% + 8px)`,
              width: `calc(${100 / 7}% - 16px)`,
              top: `calc(32px + ${(ev.r0 / rows) * (440 - 40)}px + 2px)`,
              height: `calc(${(ev.hh / rows) * (440 - 40)}px - 6px)`,
              backgroundColor: ev.color,
            }}
          >
            <div className="text-[11px] font-semibold text-white">{ev.label}</div>
            <div className="text-[10.5px] text-white/90">{ev.time}</div>
          </div>
        ))}
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
        {CALENDAR_LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2 text-[12px] text-mc-sub">
            <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
