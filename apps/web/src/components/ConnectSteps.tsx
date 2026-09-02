import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Chip, PillButton, SectionLabel } from './ui'

/**
 * ConnectSteps — the 8-step onboarding runbook data + card renderers for the
 * /connect page (MC-207). Step titles/order/body copy mirror ONBOARDING.md
 * 1:1 (the doc is the source of truth); steps 5 & 7 carry a live /health probe
 * rendered by the page, everything else is honest guidance the operator
 * confirms themselves — confirmed ≠ verified, never auto-credited.
 */

export type Phase = 'host' | 'verify' | 'here'
export type OsKey = 'mac' | 'windows' | 'linux' | 'other'
export type RingState = 'done' | 'active' | 'pending'

export interface StepCmd {
  label?: string
  cmd: string
}

export interface StepLink {
  label: string
  to: string
  external?: boolean
}

export interface StepVar {
  name: string
  desc: string
}

export interface ConnectStep {
  id: number // 1..8, matches ONBOARDING.md order — do not renumber
  title: string // exact ONBOARDING.md heading text (minus the "Step N —" prefix)
  phase: Phase
  phaseLabel: string
  body: string[] // short lines; `backticks` render as inline code
  commands?: StepCmd[]
  secrets?: boolean // true → render <SecretsCallout/> (step 3 only)
  probe?: 'health' // true → page injects a live probe zone (steps 5 & 7)
  vars?: StepVar[]
  links?: StepLink[]
  confirmable: boolean // static steps get the "Mark done — I did this" chip
}

/** Per-OS tunnel commands (existing record shape, labels kept). */
export const OS_STEPS: Record<OsKey, { name: string; cmd: string; note: string }> = {
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
    name: 'Other',
    cmd: 'ssh -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 ubuntu@<your-server-ip>',
    note: 'Open your terminal and run the command below.',
  },
}

export const OS_KEYS = Object.keys(OS_STEPS) as OsKey[]

/**
 * The eight steps, in ONBOARDING.md order. Titles are the doc's headings
 * verbatim; bodies stay doc-faithful in spirit. Step 3 mirrors the *merged*
 * doc (MC-215): root `.env` + `cp .env.example .env` + the full var list.
 */
export const STEP_DATA: ConnectStep[] = [
  {
    id: 1,
    title: 'Confirm prerequisites',
    phase: 'host',
    phaseLabel: 'ON THE HOST',
    body: [
      'Node.js 20.17+ (or 22.9+) — the root `packageManager` is `npm@11.17.0`, which requires `^20.17 || >=22.9` — and git.',
      'Docker with the compose plugin (used for Postgres, and optionally the api + web containers).',
      'Your OpenClaw instance running — this dashboard is useless without it; it is the data source.',
    ],
    commands: [
      {
        label: 'Check the tools',
        cmd: 'node -v\ngit --version\ndocker compose version',
      },
    ],
    confirmable: true,
  },
  {
    id: 2,
    title: 'Clone and install',
    phase: 'host',
    phaseLabel: 'ON THE HOST',
    body: [
      'Clone the repo (replace `<repo-url>` with the URL you were given), then install dependencies.',
      'Confirm `npm install` finished without errors.',
    ],
    commands: [{ label: 'Clone + install', cmd: 'git clone <repo-url> mission-control && cd mission-control\nnpm install' }],
    confirmable: true,
  },
  {
    id: 3,
    title: 'Create the environment file: the root .env',
    phase: 'host',
    phaseLabel: 'ON THE HOST',
    body: [
      'Docker Compose reads exactly one env file: the **root** `.env` (next to `docker-compose.yml`). `apps/api/.env.example` is only a template for non-Docker runs — copy the root template:',
      'Then go through every variable with the human who owns the real values — never invent one (see the secrets note below).',
    ],
    commands: [{ label: 'Copy the env template', cmd: 'cp .env.example .env' }],
    secrets: true,
    vars: [
      {
        name: 'DATABASE_URL',
        desc: 'Keep the template default — compose’s Postgres matches it. Change it only if you override `POSTGRES_PASSWORD` in `.env`.',
      },
      {
        name: 'INGEST_TOKEN',
        desc: 'Shared secret for the event bridge. You MAY generate this one locally with `openssl rand -hex 24` (a random secret, not an account credential); it also goes into your OpenClaw bridge config. Blank → compose falls back to `dev-ingest-token`.',
      },
      {
        name: 'SOCKET_TOKEN',
        desc: 'Optional — guards the dashboard’s live socket when the api runs in production. Blank → `dev-socket-token` (the stack is loopback-only). If you set a real value, set it **before the first `docker compose build`** — it is baked into the web bundle.',
      },
      {
        name: 'WEB_ORIGIN',
        desc: 'Template default covers `localhost` + `127.0.0.1`. Add your tunnel origin later if you access the dashboard remotely.',
      },
      {
        name: 'GITHUB_TOKEN · DEEPSEEK_API_KEY · ZAI_API_KEY (optional)',
        desc: 'Ask the human to paste these only if they want those features — GitHub enables PR approvals → auto-merge; DeepSeek/ZAI keys enable live balances on Health/Usage. Everything else works without them.',
      },
    ],
    confirmable: true,
  },
  {
    id: 4,
    title: 'Start the stack',
    phase: 'host',
    phaseLabel: 'ON THE HOST',
    body: [
      'Wait for all three services to be up: db healthy, api, web. The first `--build` compiles the images, so it takes a while.',
      'Confirm the api is **not** crash-looping: `docker compose logs api` should end with the migrations applied and `mission-control api listening on 0.0.0.0:3000`.',
      'Prefer no Docker? Postgres is still required — the two-terminal dev path (export the root `.env`, `npx prisma migrate deploy`, `npm run start:dev -w apps/api`) is in ONBOARDING.md step 4.',
    ],
    commands: [
      { label: 'Build + start', cmd: 'docker compose up -d --build' },
      { label: 'Service status', cmd: 'docker compose ps' },
    ],
    confirmable: true,
  },
  {
    id: 5,
    title: 'Verify the dashboard',
    phase: 'verify',
    phaseLabel: 'VERIFY',
    body: [
      'Open `http://localhost:5173` — the Overview loads and the topbar shows a green “Connected” dot (live socket).',
      '`/health` shows real uptime, client count, and database state; empty states show actions, never fake numbers.',
      'Dot stays red on the Docker path? The api is down, or the `SOCKET_TOKEN` baked into the web build doesn’t match the api’s — set it in `.env` and rebuild with `docker compose up -d --build`.',
    ],
    probe: 'health',
    confirmable: false,
  },
  {
    id: 6,
    title: 'Connect their OpenClaw (the bridge)',
    phase: 'verify',
    phaseLabel: 'VERIFY',
    body: [
      'The dashboard is only as live as the data it receives: your OpenClaw instance must POST typed events to `http://127.0.0.1:3000/events` with header `x-ingest-token: <the INGEST_TOKEN from Step 3’s root .env>`.',
      'Standard pattern: a cron bridge job in the OpenClaw workspace that pushes agents/sessions/calendar/usage/approvals snapshots + run events.',
      'The Live Activity band should show real events within a minute. None? Check the bridge sends the **same** token compose sees — an unset `INGEST_TOKEN` silently falls back to `dev-ingest-token` and the bridge would get 401.',
    ],
    links: [{ label: 'README — Event flow', to: 'https://github.com/jaysinghcodes/mission-control#event-flow-the-live-activity-feed', external: true }],
    confirmable: true,
  },
  {
    id: 7,
    title: 'Connect from another machine (optional)',
    phase: 'here',
    phaseLabel: 'YOU ARE HERE',
    body: [
      'Run the exact command for the OS you are on, replacing `<your-server-ip>` with your OpenClaw host (public IP or tailnet name).',
      'Port 5173 = this dashboard, port 3000 = the API. Keep the SSH session open while you browse.',
    ],
    probe: 'health',
    confirmable: false,
  },
  {
    id: 8,
    title: 'Smoke test',
    phase: 'here',
    phaseLabel: 'YOU ARE HERE',
    body: [
      'Tickets: create one → it lands in To-Do; start it → it travels Build → QA → Review → Done and persists to the activity stream.',
      'Calendar: all your OpenClaw cron jobs are listed — weekly grid, ‹ › week navigation works.',
      'Office: agents physically move between rooms when a `run.*` event fires.',
      'Live Activity: recently run tasks show up there.',
    ],
    links: [
      { label: 'Tickets', to: '/tickets' },
      { label: 'Calendar', to: '/calendar' },
      { label: 'Office', to: '/office' },
      { label: 'Live Activity', to: '/activity' },
    ],
    confirmable: true,
  },
]

/** Shared ring styles: done = green w/ ✓, active = primary outline, pending = faint. */
export function ringClass(state: RingState): string {
  if (state === 'done') return 'bg-mc-greenbg text-mc-greentext'
  if (state === 'active') return 'border border-mc-primary text-mc-text'
  return 'bg-mc-inner text-mc-faint'
}

/** Render body/desc text: `backtick` → inline mono code, **double-star** → emphasis. */
export function fmt(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let key = 0
  // Tokenise into plain / `code` / **bold** segments, then recursively render.
  for (const seg of text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)) {
    if (!seg) continue
    if (seg.startsWith('`') && seg.endsWith('`')) {
      out.push(
        <code key={key++} className="rounded bg-mc-inner px-1 py-px font-mono text-[12px] text-mc-text">
          {seg.slice(1, -1)}
        </code>,
      )
    } else if (seg.startsWith('**') && seg.endsWith('**')) {
      out.push(
        <strong key={key++} className="font-semibold text-mc-text">
          {seg.slice(2, -2)}
        </strong>,
      )
    } else {
      out.push(<span key={key++}>{seg}</span>)
    }
  }
  return out
}

/** Mono command block with an optional copy button (clipboard API, aria-labelled). */
export function CodeBlock({ cmd, label }: { cmd: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const canCopy = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'
  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable (permissions etc.) — degrade silently
    }
  }
  return (
    <div className="mt-3">
      {label && <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-mc-faint">{label}</div>}
      <div className="relative">
        <pre className="whitespace-pre-wrap overflow-x-auto rounded-lg bg-mc-inner p-4 pr-16 font-mono text-[13px] leading-relaxed text-mc-text">
          {cmd}
        </pre>
        {canCopy && (
          <button
            type="button"
            onClick={() => void copy()}
            aria-label={copied ? 'Copied' : 'Copy command'}
            className="absolute top-2.5 right-2.5 h-7 rounded-md border border-mc-border bg-mc-card px-2 text-[11px] font-semibold text-mc-faint transition-colors duration-150 hover:text-mc-text focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

/** Secrets callout — step 3 only. Verbatim guardrail stance + the root-.env vars. */
export function SecretsCallout({ vars }: { vars: StepVar[] }) {
  return (
    <div className="mt-4 rounded-r-lg border-l-2 border-mc-orange bg-mc-inner py-3 pl-4 pr-3">
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full border border-mc-orange text-[10px] font-bold leading-none text-mc-orangetext"
        >
          !
        </span>
        <div>
          <p className="text-[13px] font-semibold leading-snug text-mc-text">
            Never invent or guess credentials — ask the human who owns them.
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-mc-sub">
            Pause and ask for every real secret; redact secrets in any echoed output; show the command before running it;
            side-effecting actions stay approval-gated.
          </p>
        </div>
      </div>
      <div className="mt-3 border-t border-mc-border/60 pt-3">
        <SectionLabel>Required vars — the root .env</SectionLabel>
        <div className="mt-2.5 space-y-2.5">
          {vars.map((v) => (
            <div key={v.name}>
              <div className="font-mono text-[12.5px] font-semibold text-mc-text">{v.name}</div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-mc-sub">{fmt(v.desc)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-mc-faint">{fmt('`.env` is git-ignored — never commit it.')}</p>
      </div>
    </div>
  )
}

/** One numbered step card. `children` = the page-injected dynamic zone (probe / OS switcher). */
export function ConnectStepCard({
  step,
  state,
  confirmed,
  onConfirm,
  onUndo,
  children,
}: {
  step: ConnectStep
  state: RingState
  confirmed: boolean
  onConfirm: (id: number) => void
  onUndo: (id: number) => void
  children?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3.5">
      {/* Number ring — done = ✓, active = current step, pending otherwise */}
      <span
        aria-hidden
        className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-150 ${ringClass(state)}`}
      >
        {state === 'done' ? '✓' : step.id}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3 className="text-[15px] font-semibold leading-snug text-mc-text">{step.title}</h3>
          <Chip label={step.phaseLabel} bg="var(--mc-inner)" fg="var(--mc-faint)" h={18} fs="text-[9.5px]" />
        </div>
        <div className="mt-1">
          {step.body.map((line, i) => (
            <p key={i} className="mt-1.5 text-[12.5px] leading-relaxed text-mc-sub">
              {fmt(line)}
            </p>
          ))}
        </div>
        {step.commands?.map((c, i) => <CodeBlock key={i} cmd={c.cmd} label={c.label} />)}
        {step.secrets && step.vars && <SecretsCallout vars={step.vars} />}
        {step.links && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {step.links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.to}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center rounded-full border border-mc-border bg-mc-card px-4 text-[12.5px] font-semibold text-mc-sub transition-colors duration-150 hover:text-mc-text focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
                >
                  {l.label} ↗
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className="inline-flex h-8 items-center rounded-full border border-mc-border bg-mc-card px-4 text-[12.5px] font-semibold text-mc-sub transition-colors duration-150 hover:text-mc-text focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
                >
                  {l.label} →
                </Link>
              ),
            )}
          </div>
        )}
        {children}
        {step.confirmable &&
          (confirmed ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-mc-greentext">
              <span>✓ Done — you confirmed this</span>
              <button
                type="button"
                onClick={() => onUndo(step.id)}
                className="rounded text-[11.5px] font-medium text-mc-faint underline underline-offset-2 transition-colors duration-150 hover:text-mc-sub focus:outline-none focus-visible:ring-2 focus-visible:ring-mc-primary"
              >
                Undo
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <PillButton label="✓ Mark done — I did this" onClick={() => onConfirm(step.id)} />
            </div>
          ))}
      </div>
    </div>
  )
}
