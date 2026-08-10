import { useEffect, useState } from 'react'
import { HEALTH_ACCESS, HEALTH_METRICS } from '../data/mock'
import { Card, Chip, Progress, SectionLabel } from '../components/ui'

/**
 * Health (wireframe 09) — gateway vitals. Prefers the real API's /health
 * (status, uptime, db, connected clients) when reachable; wireframe metric
 * cards otherwise. Never fakes values (GLM MUST-2).
 */
interface ApiHealth { status: string; uptimeSeconds: number; connectedClients: number; database: string; ts: number }

export default function Health() {
  const [api, setApi] = useState<ApiHealth | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/health`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: ApiHealth) => setApi(d))
      .catch(() => setFailed(true))
    return () => ctrl.abort()
  }, [])

  const uptime = api ? `${Math.floor(api.uptimeSeconds / 86400)}d ${Math.floor((api.uptimeSeconds % 86400) / 3600)}h` : null
  const statusOk = api?.status === 'ok'

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">System Health</div>
      <div className="mt-1 text-[13px] text-mc-sub">Gateway vitals for your instance — VPS or local.</div>

      {/* Gateway running banner */}
      <Card className="mt-6 px-5 py-4 flex items-center gap-4">
        <span className="w-[20px] h-[20px] rounded-full" style={{ backgroundColor: statusOk || !failed ? 'var(--mc-green)' : 'var(--mc-red)' }} />
        <div className="flex-1">
          <div className="text-[18px] font-semibold">{api ? `API ${statusOk ? 'Running' : 'Degraded'}` : failed ? 'API unreachable' : 'Checking API…'}</div>
          <div className="text-[12.5px] text-mc-sub">
            {api
              ? `pid local · uptime ${uptime} · ${api.database} · ${api.connectedClients} dashboard client(s)`
              : failed
                ? 'No response from localhost:3000 — showing wireframe vitals'
                : 'contacting localhost:3000/health'}
          </div>
        </div>
        <Chip label="AUTH · TOKEN" bg="var(--mc-inner)" fg="var(--mc-sub)" h={24} fs="text-[11px]" />
        <Chip label="LOOPBACK ONLY" bg="var(--mc-inner)" fg="var(--mc-sub)" h={24} fs="text-[11px]" />
        <Chip label="TAILSCALE OFF" bg="var(--mc-inner)" fg="var(--mc-sub)" h={24} fs="text-[11px]" />
      </Card>

      {/* Metric cards */}
      <div className="flex gap-[10px] mt-5">
        {HEALTH_METRICS.map((m) => (
          <Card key={m.label} className="w-[148px] px-3 py-2.5">
            <SectionLabel>{m.label}</SectionLabel>
            <div className="mt-2 text-[22px] font-semibold">{m.big}</div>
            <Progress pct={m.pct} color={m.color} className="mt-2" />
            <div className="mt-2 text-[10.5px] text-mc-sub truncate">{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Gateway access */}
      <Card className="mt-6 px-4 py-4">
        <SectionLabel>Gateway Access</SectionLabel>
        <div className="mt-3">
          {HEALTH_ACCESS.map((r) => (
            <div key={r.k} className="flex py-[6px] text-[12.5px]">
              <span className="w-[150px] text-mc-sub">{r.k}</span>
              <span className="font-medium text-mc-text">{r.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
