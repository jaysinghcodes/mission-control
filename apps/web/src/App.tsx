import './App.css'

/**
 * Mission Control — Overview screen (v0.1 shell)
 *
 * Layout follows the design system locked in #design (see design-studio skill):
 *   - Sidebar: WORKSPACE / TEAM / OBSERVE groups, agent color-coding
 *   - Topbar: minimal, no duplicated info
 *   - KPI tiles: real values only, wrapped in cards (never bare text)
 *   - Live Activity band: scheduled runs incl. Trend Radar (Jay's pick)
 *
 * Dark-first tokens live in src/index.css (Tailwind v4 @theme).
 * This is a static shell — the live WebSocket feed replaces the hardcoded
 * activity rows in a later PR (feat/2-live-feed).
 */

/** Sidebar navigation groups — drives the left rail sections. */
const SIDEBAR_GROUPS: { label: string; items: { name: string; color?: string }[] }[] = [
  {
    label: 'WORKSPACE',
    items: [{ name: 'Overview' }, { name: 'Tasks' }, { name: 'Backlog' }, { name: 'Calendar' }],
  },
  {
    label: 'TEAM',
    // Agent colors are consistent across all screens (design convention):
    // Henry=purple, Ralph=amber, Scout=green, Echo=teal
    items: [
      { name: 'Henry', color: 'bg-mc-purple' },
      { name: 'Ralph', color: 'bg-mc-amber' },
      { name: 'Scout', color: 'bg-mc-green' },
      { name: 'Echo', color: 'bg-mc-teal' },
    ],
  },
  {
    label: 'OBSERVE',
    items: [{ name: 'Activity' }, { name: 'Health' }, { name: 'Sessions' }, { name: 'Logs' }, { name: 'Agents' }],
  },
]

/** KPI tiles on the Overview — values are real placeholders from the wireframes. */
const KPIS = [
  { label: 'Tasks Today', value: '12', color: 'text-mc-blue' },
  { label: 'Running', value: '3', color: 'text-mc-green' },
  { label: 'Pending Approval', value: '2', color: 'text-mc-amber' },
  { label: 'Health', value: '74ms', color: 'text-mc-text' },
]

/** Live Activity band rows — mirrors the calendar wireframe (05-calendar). */
const ACTIVITY = [
  { t: 'Morning Brief', d: '6:30a', c: 'bg-mc-amber' },
  { t: 'Trend Radar', d: '9:00a', c: 'bg-mc-orange' }, // Jay's favorite — keep prominent
  { t: 'Scout Scan', d: '6:55a', c: 'bg-mc-green' },
  { t: 'Quill Writer', d: '8:00a', c: 'bg-mc-teal' },
  { t: 'Weekly', d: '9:30a', c: 'bg-mc-blue' },
]

function App() {
  return (
    <div className="flex h-screen bg-mc-bg text-mc-text">
      {/* ── Sidebar (13.5px labels, muted active state = subtle bg) ────────── */}
      <aside className="w-56 shrink-0 bg-mc-sidebar border-r border-white/5 p-4">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <div className="text-[13.5px] font-semibold tracking-wide text-mc-sub mt-6 mb-3">{group.label}</div>
            <nav className="space-y-1 text-[13.5px]">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                    item.name === 'Overview' ? 'bg-white/5 text-mc-text' : 'text-mc-sub hover:text-mc-text'
                  }`}
                >
                  {item.color && <span className={`w-2 h-2 rounded-full ${item.color}`} />}
                  {item.name}
                </div>
              ))}
            </nav>
          </div>
        ))}
      </aside>

      {/* ── Main column: topbar + content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <header className="h-[42px] shrink-0 bg-mc-topbar border-b border-white/5 flex items-center px-4 justify-between text-[12.5px]">
          <div className="text-mc-sub">mission-control</div>
          <div className="flex items-center gap-4">
            {/* No redundant info: connection state lives here, not in sidebar */}
            <span className="text-mc-green">● online</span>
            <span className="w-7 h-7 rounded-full bg-mc-blue/20 text-mc-blue flex items-center justify-center text-[11px]">J</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-[22px] font-semibold mb-6">Overview</h1>

          {/* KPI tiles — cards required (bare text + dividers reads flat) */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="bg-mc-card rounded-xl border border-white/5 p-4">
                <div className="text-[12px] text-mc-sub mb-1">{kpi.label}</div>
                <div className={`text-[22px] font-semibold ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Live Activity band — becomes WebSocket-driven in feat/2 */}
          <div className="bg-mc-card rounded-xl border border-white/5 p-4 mb-6">
            <div className="text-[12px] text-mc-sub mb-3 font-semibold tracking-wide">LIVE ACTIVITY</div>
            <div className="space-y-2">
              {ACTIVITY.map((ev) => (
                <div key={ev.t} className="flex items-center gap-3 text-[12.5px]">
                  <span className={`w-2 h-2 rounded-full ${ev.c}`} />
                  <span className="text-mc-text">{ev.t}</span>
                  <span className="text-mc-tert ml-auto">{ev.d}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
