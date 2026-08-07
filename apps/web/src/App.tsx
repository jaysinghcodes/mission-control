import './App.css'

function App() {
  return (
    <div className="flex h-screen bg-mc-bg text-mc-text">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-mc-sidebar border-r border-white/5 p-4">
        <div className="text-[13.5px] font-semibold tracking-wide text-mc-sub mb-6">WORKSPACE</div>
        <nav className="space-y-1 text-[13.5px]">
          {['Overview', 'Tasks', 'Backlog', 'Calendar'].map((item) => (
            <div key={item} className={`px-3 py-1.5 rounded-lg ${item === 'Overview' ? 'bg-white/5 text-mc-text' : 'text-mc-sub hover:text-mc-text'}`}>
              {item}
            </div>
          ))}
        </nav>
        <div className="text-[13.5px] font-semibold tracking-wide text-mc-sub mt-8 mb-6">TEAM</div>
        <nav className="space-y-1 text-[13.5px]">
          {['Henry', 'Ralph', 'Scout', 'Echo'].map((item) => (
            <div key={item} className="px-3 py-1.5 rounded-lg text-mc-sub hover:text-mc-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mc-purple" />{item}
            </div>
          ))}
        </nav>
        <div className="text-[13.5px] font-semibold tracking-wide text-mc-sub mt-8 mb-6">OBSERVE</div>
        <nav className="space-y-1 text-[13.5px]">
          {['Activity', 'Health', 'Sessions', 'Logs', 'Agents'].map((item) => (
            <div key={item} className="px-3 py-1.5 rounded-lg text-mc-sub hover:text-mc-text">{item}</div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-[42px] shrink-0 bg-mc-topbar border-b border-white/5 flex items-center px-4 justify-between text-[12.5px]">
          <div className="text-mc-sub">mission-control</div>
          <div className="flex items-center gap-4">
            <span className="text-mc-green">● online</span>
            <span className="w-7 h-7 rounded-full bg-mc-blue/20 text-mc-blue flex items-center justify-center text-[11px]">J</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-[22px] font-semibold mb-6">Overview</h1>

          {/* KPI tiles */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tasks Today', value: '12', color: 'text-mc-blue' },
              { label: 'Running', value: '3', color: 'text-mc-green' },
              { label: 'Pending Approval', value: '2', color: 'text-mc-amber' },
              { label: 'Health', value: '74ms', color: 'text-mc-text' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-mc-card rounded-xl border border-white/5 p-4">
                <div className="text-[12px] text-mc-sub mb-1">{kpi.label}</div>
                <div className={`text-[22px] font-semibold ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Live Activity band — Trend Radar included */}
          <div className="bg-mc-card rounded-xl border border-white/5 p-4 mb-6">
            <div className="text-[12px] text-mc-sub mb-3 font-semibold tracking-wide">LIVE ACTIVITY</div>
            <div className="space-y-2">
              {[
                { t: 'Morning Brief', d: '6:30a', c: 'bg-mc-amber' },
                { t: 'Trend Radar', d: '9:00a', c: 'bg-mc-orange' },
                { t: 'Scout Scan', d: '6:55a', c: 'bg-mc-green' },
                { t: 'Quill Writer', d: '8:00a', c: 'bg-mc-teal' },
                { t: 'Weekly', d: '9:30a', c: 'bg-mc-blue' },
              ].map((ev) => (
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
