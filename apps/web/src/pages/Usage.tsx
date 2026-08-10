import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Card, Chip, PillButton, Progress, SectionLabel } from '../components/ui'

/**
 * Usage & Cost — real usage snapshot pushed by the bridge (usage.snapshot).
 */

interface Usage { period: string; totalCost: number; tokensIn: number; tokensOut: number; providers: Record<string, { name: string; model: string; cost: number; pct: number; detail: string }> | null }
interface UsageResp { usage: Usage | null }

const RANGES = ['24h', '7d', '30d', 'month']

export default function Usage() {
  const [range, setRange] = useState('24h')
  const { data, error } = useApi<UsageResp>(`/usage?period=${range}`, { pollMs: 30000 })
  const usage = data?.usage
  const providers = usage?.providers ? Object.values(usage.providers) : []

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Usage &amp; Cost</div>
      <div className="mt-1 text-[13px] text-mc-sub">Token spend per provider and model — real numbers from this instance.</div>

      <div className="flex gap-3 mt-6">
        {RANGES.map((r) => (
          <PillButton key={r} label={r === 'month' ? 'This month' : r} on={range === r} onClick={() => setRange(r)} />
        ))}
      </div>

      <Card className="mt-6 px-4 py-4">
        <SectionLabel>Total Estimated Spend</SectionLabel>
        <div className="mt-2 text-[30px] font-semibold">{usage ? `$${usage.totalCost.toFixed(2)}` : '—'}</div>
        <div className="text-[12px] text-mc-sub">
          {usage ? `${usage.tokensIn.toLocaleString()} tokens in · ${usage.tokensOut.toLocaleString()} tokens out` : (error ? 'API unreachable' : 'No usage snapshot synced yet — the bridge pushes it every few minutes.')}
        </div>
        <Chip label="PEAK WINDOW 01:00–07:00 CT" bg="var(--mc-orangebg)" fg="var(--mc-orangetext)" h={24} fs="text-[10.5px]" className="mt-3" />
      </Card>

      <div className="flex gap-[18px] mt-6">
        {providers.map((p) => (
          <Card key={p.name} className="w-[248px] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--mc-blue)' }} />
              <span className="text-[14.5px] font-semibold">{p.name}</span>
            </div>
            <div className="mt-2 font-mono text-[12px] text-mc-sub">{p.model}</div>
            <div className="mt-2 text-[24px] font-semibold">${p.cost.toFixed(2)}</div>
            <div className="text-[11px] text-mc-sub">{p.detail}</div>
            <div className="flex items-center gap-2 mt-3">
              <Progress pct={p.pct} color="var(--mc-blue)" w="flex-1" />
              <span className="text-[10.5px] text-mc-faint">{p.pct}%</span>
            </div>
          </Card>
        ))}
        {providers.length === 0 && !error && (
          <Card className="w-full px-4 py-6 text-[12.5px] text-mc-faint">No provider breakdown yet.</Card>
        )}
      </div>

      <p className="mt-6 text-[12.5px] text-mc-sub">
        Peak-pricing alert: DeepSeek charges 2× during 01:00–07:00 CT — cron alerts are already wired.
      </p>
    </div>
  )
}
