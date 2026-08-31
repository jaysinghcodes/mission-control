import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Card, Chip, PillButton, Progress, SectionLabel } from '../components/ui'

/**
 * Usage & Cost — real usage snapshot pushed by the bridge (usage.snapshot).
 *
 * Provider entries are intentionally shape-tolerant: the bridge may push
 * {name, balance} (account balance), {name, model, cost, pct, detail}
 * (estimated spend) or {name, tokensIn, tokensOut} (token usage). Any
 * missing field renders as "—" — a provider row must NEVER crash the page.
 */

interface Provider {
  name?: string
  model?: string
  balance?: number
  cost?: number
  pct?: number
  detail?: string
  tokensIn?: number
  tokensOut?: number
}

interface Usage {
  period: string
  totalCost: number
  tokensIn: number
  tokensOut: number
  providers: Provider[] | Record<string, Provider> | null
}
interface UsageResp { usage: Usage | null }

const RANGES = ['24h', '7d', '30d', 'month']

const fmt = (n: number | undefined): string => (typeof n === 'number' && Number.isFinite(n) ? `$${n.toFixed(2)}` : '—')
const num = (n: number | undefined): string => (typeof n === 'number' ? n.toLocaleString() : '—')

export default function Usage() {
  const [range, setRange] = useState('24h')
  const { data, error } = useApi<UsageResp>(`/usage?period=${range}`, { pollMs: 30000 })
  const usage = data?.usage

  // Normalize providers: array or object → array; tolerate anything missing.
  let providers: Provider[] = []
  if (Array.isArray(usage?.providers)) providers = usage.providers
  else if (usage?.providers && typeof usage.providers === 'object') providers = Object.values(usage.providers)

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
        <div className="mt-2 text-[30px] font-semibold">{usage ? fmt(usage.totalCost) : '—'}</div>
        <div className="text-[12px] text-mc-sub">
          {usage
            ? `${num(usage.tokensIn)} tokens in · ${num(usage.tokensOut)} tokens out`
            : error
              ? 'API unreachable'
              : 'No usage snapshot for this period yet — the bridge syncs every few minutes.'}
        </div>
        <Chip label="PEAK WINDOW 01:00–07:00 CT" bg="var(--mc-orangebg)" fg="var(--mc-orangetext)" h={24} fs="text-[10.5px]" className="mt-3" />
      </Card>

      <div className="flex gap-[18px] mt-6 flex-wrap">
        {providers.map((p, i) => (
          <Card key={p.name ?? `provider-${i}`} className="w-[248px] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--mc-blue)' }} />
              <span className="text-[14.5px] font-semibold">{p.name ?? 'Provider'}</span>
            </div>
            <div className="mt-2 font-mono text-[12px] text-mc-sub">{p.model ?? '—'}</div>
            <div className="mt-2 text-[24px] font-semibold">{p.balance != null ? fmt(p.balance) : fmt(p.cost)}</div>
            <div className="text-[11px] text-mc-sub">{p.balance != null ? 'account balance' : p.detail ?? '—'}</div>
            {typeof p.pct === 'number' && (
              <div className="flex items-center gap-2 mt-3">
                <Progress pct={p.pct} color="var(--mc-blue)" w="flex-1" />
                <span className="text-[10.5px] text-mc-faint">{p.pct}%</span>
              </div>
            )}
            {typeof p.tokensIn === 'number' && (
              <div className="mt-2 text-[11px] text-mc-faint">{num(p.tokensIn)} in · {num(p.tokensOut)} out</div>
            )}
          </Card>
        ))}
        {providers.length === 0 && !error && (
          <Card className="w-full px-4 py-6 text-[12.5px] text-mc-faint">
            No provider breakdown yet — the bridge pushes balances/tokens every few minutes. Want exact billing? Add your
            provider API keys (DeepSeek / Z.AI platform keys) and I'll wire live cost queries.
          </Card>
        )}
      </div>

      <p className="mt-6 text-[12.5px] text-mc-sub">
        Peak-pricing alert: DeepSeek charges 2× during 01:00–07:00 CT — cron alerts are already wired.
      </p>
    </div>
  )
}
