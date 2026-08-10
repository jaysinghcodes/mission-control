import { useState } from 'react'
import { USAGE_PROVIDERS } from '../data/mock'
import { Card, Chip, PillButton, Progress, SectionLabel } from '../components/ui'

/**
 * Usage & Cost (wireframe 11) — estimated token spend per provider/model,
 * with the DeepSeek peak-window alert (2× pricing 01:00–07:00 CT).
 */
const RANGES = ['24h', '7d', '30d', 'This month']

export default function Usage() {
  const [range, setRange] = useState('24h')

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Usage &amp; Cost</div>
      <div className="mt-1 text-[13px] text-mc-sub">Token spend per provider and model.</div>

      <div className="flex gap-3 mt-6">
        {RANGES.map((r) => (
          <PillButton key={r} label={r} on={range === r} onClick={() => setRange(r)} />
        ))}
      </div>

      <Card className="mt-6 px-4 py-4">
        <SectionLabel>Total Estimated Spend</SectionLabel>
        <div className="mt-2 text-[30px] font-semibold">$4.82</div>
        <div className="text-[12px] text-mc-sub">last 24h · 1.2M tokens in · 340K tokens out</div>
        <Chip label="PEAK WINDOW 01:00–07:00 CT" bg="var(--mc-orangebg)" fg="var(--mc-orangetext)" h={24} fs="text-[10.5px]" className="mt-3" />
      </Card>

      <div className="flex gap-[18px] mt-6">
        {USAGE_PROVIDERS.map((p) => (
          <Card key={p.name} className="w-[248px] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.dot }} />
              <span className="text-[14.5px] font-semibold">{p.name}</span>
            </div>
            <div className="mt-2 font-mono text-[12px] text-mc-sub">{p.model}</div>
            <div className="mt-2 text-[24px] font-semibold">{p.cost}</div>
            <div className="text-[11px] text-mc-sub">{p.detail}</div>
            <div className="flex items-center gap-2 mt-3">
              <Progress pct={p.pct} color={p.dot} w="flex-1" />
              <span className="text-[10.5px] text-mc-faint">{p.pct}%</span>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-[12.5px] text-mc-sub">
        Peak-pricing alert: DeepSeek charges 2× during 01:00–07:00 CT — cron alerts are already wired.
      </p>
    </div>
  )
}
