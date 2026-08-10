import { useApi } from '../hooks/useApi'
import { Card } from '../components/ui'

/**
 * Calendar — REAL cron jobs from the OpenClaw instance (synced via
 * calendar.snapshot). Rendered as a week grid; colors map to job names.
 */

interface Job { id: string; name: string; schedule: string | null; day: number | null; time: string | null; color: string | null; enabled: boolean }
interface CalendarResp { jobs: Job[] }

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function jobColor(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('brief')) return 'var(--mc-yellow)'
  if (n.includes('radar') || n.includes('peak') || n.includes('alert')) return 'var(--mc-orange)'
  if (n.includes('bridge') || n.includes('poll')) return 'var(--mc-blue)'
  if (n.includes('scan')) return 'var(--mc-green)'
  if (n.includes('write') || n.includes('quill')) return 'var(--mc-teal)'
  return 'var(--mc-purple)'
}

export default function Calendar() {
  const { data, error } = useApi<CalendarResp>('/calendar', { pollMs: 30000 })
  const jobs = data?.jobs ?? []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[22px] font-semibold">Scheduled Tasks</div>
          <div className="mt-1 text-[13px] text-mc-sub">Real cron jobs and recurring routines from OpenClaw.</div>
        </div>
        <div className="flex items-center gap-4 text-mc-sub">
          <button type="button" className="text-[22px] leading-none hover:text-mc-text">‹</button>
          <span className="text-[16px] font-semibold text-mc-text">August 2026</span>
          <button type="button" className="text-[22px] leading-none hover:text-mc-text">›</button>
        </div>
      </div>

      <Card className="mt-6 rounded-2xl px-0 py-0 relative h-[440px] overflow-hidden">
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

        {jobs.length === 0 && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-mc-faint px-10 text-center">
            No scheduled jobs synced yet. The bridge pushes real cron jobs here every few minutes —
            ask Jarvis to schedule something and it'll appear.
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-mc-faint px-10 text-center">
            API unreachable — can't load the schedule.
          </div>
        )}

        {jobs.map((job, i) => {
          const col = job.day != null ? Math.max(0, Math.min(6, job.day)) : (i % 7)
          const row = i % 4
          return (
            <div
              key={job.id}
              className="absolute rounded-lg px-2 py-1 overflow-hidden"
              style={{
                left: `calc(${(col / 7) * 100}% + 8px)`,
                width: `calc(${100 / 7}% - 16px)`,
                top: `calc(32px + ${(row / 4) * 400}px + 2px)`,
                height: 92,
                backgroundColor: job.color ?? jobColor(job.name),
              }}
            >
              <div className="text-[11px] font-semibold text-white truncate">{job.name}</div>
              <div className="text-[10.5px] text-white/90">{job.time ?? job.schedule ?? 'daily'}</div>
              {!job.enabled && <div className="text-[9.5px] text-white/70 mt-0.5">paused</div>}
            </div>
          )
        })}
      </Card>

      {jobs.length > 0 && (
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
          {jobs.map((j) => (
            <span key={j.id} className="flex items-center gap-2 text-[12px] text-mc-sub">
              <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: j.color ?? jobColor(j.name) }} />
              {j.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
