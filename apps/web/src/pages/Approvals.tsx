import { useState } from 'react'
import { useApi, apiPost } from '../hooks/useApi'
import { Card, Inner, PillButton } from '../components/ui'

/**
 * Approvals — real pending approval requests (synced via approvals.snapshot).
 * Approve/Reject posts a decision to the API, which broadcasts it; the
 * bridge executes decisions against the gateway.
 */

interface Approval { id: string; kind: string; tag: string; desc: string; status: string; createdAt: string }
interface ApprovalsResp { approvals: Approval[] }

const KIND_ICON: Record<string, { glyph: string; color: string }> = {
  exec: { glyph: '›_', color: 'var(--mc-red)' },
  pair: { glyph: '⧉', color: 'var(--mc-blue)' },
  msg: { glyph: '✉', color: 'var(--mc-purple)' },
  sess: { glyph: '⑂', color: 'var(--mc-teal)' },
}

const FILTERS = ['All', 'Exec', 'Pairing', 'Messages', 'Sessions']

export default function Approvals() {
  const { data, refetch } = useApi<ApprovalsResp>('/approvals', { pollMs: 15000 })
  const [filter, setFilter] = useState('All')
  const rows = (data?.approvals ?? []).filter((r) => filter === 'All' || r.tag.toLowerCase().startsWith(filter.toLowerCase()))

  async function decide(id: string, action: 'approve' | 'reject') {
    await apiPost(`/approvals/${id}/decide`, { action })
    void refetch()
  }

  return (
    <div className="p-6">
      <div className="text-[22px] font-semibold">Approvals</div>
      <div className="mt-1 text-[13px] text-mc-sub">Everything waiting on you — approve or reject in one click.</div>

      <div className="flex gap-3 mt-6">
        {FILTERS.map((f) => (
          <PillButton key={f} label={f} on={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <Card className="mt-6 rounded-2xl px-0 pb-1 overflow-hidden">
        {rows.length === 0 && (
          <div className="px-[18px] py-10 text-[12.5px] text-mc-faint">
            Nothing pending approval right now. Requests from agents (exec, pairing, messages, session forks) land here live.
          </div>
        )}
        {rows.map((row, i) => {
          const icon = KIND_ICON[row.kind] ?? { glyph: '?', color: 'var(--mc-faint)' }
          return (
            <div key={row.id} className={`flex items-center px-[18px] py-4 ${i < rows.length - 1 ? 'border-b border-mc-border2' : ''}`}>
              <Inner className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[13px] font-semibold mr-4">
                <span style={{ color: icon.color }}>{icon.glyph}</span>
              </Inner>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: icon.color }}>{row.tag}</div>
                <div className="text-[13px] font-medium mt-0.5 truncate">{row.desc}</div>
              </div>
              <span className="text-[11.5px] text-mc-faint mr-6 whitespace-nowrap">{new Date(row.createdAt).toLocaleTimeString()}</span>
              <PillButton label="Approve" on className="mr-2" style={{ backgroundColor: 'var(--mc-green)' }} onClick={() => void decide(row.id, 'approve')} />
              <PillButton label="Reject" onClick={() => void decide(row.id, 'reject')} />
            </div>
          )
        })}
      </Card>
    </div>
  )
}
