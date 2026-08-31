import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PillButton, SectionLabel } from '../components/ui'

/**
 * Connect — the onboarding gate. Mission Control is useless without its API
 * (all data is live from your OpenClaw instance), so when the API is out of
 * reach this page explains exactly how to get in, per OS, and verifies the
 * connection. Once connected it hands you to the dashboard.
 *
 * Why this flow (design thinking):
 *  - Mission Control binds to loopback only (security red line) → the only
 *    way in from another machine is an SSH tunnel. Instructions > mystery.
 *  - We detect your OS (browser) and show the exact command — no guessing.
 *  - "I'm connected" verifies against the real API before unlocking the app.
 */

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function clientOS(): 'mac' | 'windows' | 'linux' | 'other' {
  const p = navigator.platform.toLowerCase()
  if (p.includes('win')) return 'windows'
  if (p.includes('mac')) return 'mac'
  if (p.includes('linux')) return 'linux'
  return 'other'
}

const STEPS: Record<string, { name: string; cmd: string; note: string }> = {
  mac: {
    name: 'macOS',
    cmd: 'ssh -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 ubuntu@<your-server-ip>',
    note: 'Open Terminal. Replace <your-server-ip> with your OpenClaw host (public IP or tailnet name).',
  },
  windows: {
    name: 'Windows',
    cmd: 'ssh -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 ubuntu@<your-server-ip>',
    note: 'Open PowerShell — OpenSSH is built in. Replace <your-server-ip> with your OpenClaw host.',
  },
  linux: {
    name: 'Linux',
    cmd: 'ssh -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 ubuntu@<your-server-ip>',
    note: 'Open a terminal. Replace <your-server-ip> with your OpenClaw host.',
  },
  other: {
    name: 'Your machine',
    cmd: 'ssh -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 ubuntu@<your-server-ip>',
    note: 'Open your terminal and run the command below.',
  },
}

export default function Connect() {
  const nav = useNavigate()
  const [os, setOs] = useState<keyof typeof STEPS>('other')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<'ok' | 'fail' | null>(null)
  const [detail, setDetail] = useState('')

  useEffect(() => setOs(clientOS()), [])

  async function verify() {
    setChecking(true)
    setResult(null)
    // Try the configured API first, then the 127.0.0.1 spelling. Browsers can
    // resolve `localhost` to ::1 while the SSH tunnel only binds IPv4, and a
    // single-spelling CORS lockout made the gate fail in the browser even when
    // the tunnel was fine (curl worked — curl ignores CORS). Try both before
    // declaring failure.
    const bases = [API, API.replace('localhost', '127.0.0.1')]
    let detail = 'Could not reach the API on this port. Is the SSH tunnel running and is the session still open?'
    let ok = false
    for (const base of [...new Set(bases)]) {
      try {
        const res = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const h = (await res.json()) as { status: string; database: string }
          setResult('ok')
          setDetail(`API ${h.status} · database ${h.database}`)
          localStorage.setItem('mc-connected', 'true')
          ok = true
          break
        }
        detail = `API responded with ${res.status} — the tunnel may be up but the API is unhappy.`
      } catch {
        // try the next base
      }
    }
    if (!ok) {
      setResult('fail')
      setDetail(detail)
    }
    setChecking(false)
  }

  const s = STEPS[os]

  return (
    <div className="min-h-full p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="w-10 h-10 rounded-xl" />
        <div>
          <div className="text-[22px] font-semibold">Connect to your OpenClaw instance</div>
          <div className="text-[13px] text-mc-sub">Mission Control shows live data from OpenClaw — so it needs to reach it first.</div>
        </div>
      </div>

      <Card className="mt-8 px-6 py-5">
        <SectionLabel>Step 1 · Open an SSH tunnel ({s.name})</SectionLabel>
        <pre className="mt-3 whitespace-pre-wrap font-mono text-[13px] text-mc-text bg-mc-inner rounded-lg p-4">{s.cmd}</pre>
        <p className="mt-3 text-[12.5px] text-mc-sub">{s.note}</p>
        <p className="mt-2 text-[12px] text-mc-faint">
          Port 5173 = this dashboard, port 3000 = the API. Keep the SSH session open while you browse.
        </p>
      </Card>

      <Card className="mt-6 px-6 py-5">
        <SectionLabel>Step 2 · Verify the connection</SectionLabel>
        <p className="mt-2 text-[12.5px] text-mc-sub">
          Run the tunnel, then press the button. If the API answers, you're in.
        </p>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <PillButton label={checking ? 'Checking…' : 'I ran the tunnel — check connection'} on onClick={() => void verify()} />
          {result === 'ok' && (
            <>
              <span className="text-[13px] font-semibold text-mc-greentext">✓ Connected — {detail}</span>
              <PillButton label="Enter the dashboard →" on onClick={() => nav('/')} />
            </>
          )}
          {result === 'fail' && <span className="text-[13px] font-semibold text-mc-redtext">✗ {detail}</span>}
        </div>
      </Card>

      <Card className="mt-6 px-6 py-5">
        <SectionLabel>Why this flow</SectionLabel>
        <ul className="mt-3 space-y-2 text-[12.5px] text-mc-sub list-disc pl-4">
          <li>Security first: the API binds to loopback only — the SSH tunnel is the sanctioned way in, on purpose.</li>
          <li>No mystery: the exact command per OS, no hunting for it.</li>
          <li>Honest gate: nothing unlocks until the real API answers.</li>
          <li>Already connected? This page never blocks you — the dashboard loads straight away.</li>
        </ul>
      </Card>
    </div>
  )
}
