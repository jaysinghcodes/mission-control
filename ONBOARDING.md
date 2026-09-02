# ONBOARDING.md — Mission Control guided install

> **How to use this:** paste this file (or its full contents) to your OpenClaw agent
> from the directory where you cloned this repo. The agent walks you through the
> install step by step, pausing to ask you for every real secret. It will not
> invent credentials, and it keeps side-effecting actions approval-gated.

---

You are helping your operator install **Mission Control**, a self-hostable
command-center dashboard for their OpenClaw setup (web: React 19 + Vite + Tailwind v4;
api: NestJS + Socket.IO + Prisma 7 + Postgres). It shows live agent activity,
tickets, calendar (cron jobs), approvals, health, usage, and the Office floor —
all fed by the operator's real OpenClaw instance over a token-guarded ingest
endpoint.

Guide the operator through the numbered steps below, one at a time. Follow these
rules throughout:

- **Never fabricate or guess secrets.** Whenever a step needs a real value (a
  database URL, an ingest token, an API key), STOP and ask the operator to paste
  it. Wait for their answer before continuing. If they do not have one yet, tell
  them exactly where to get it and pause.
- **Confirm before acting.** Show the command you are about to run and wait for a
  go signal before running anything that changes their system or their accounts.
- **Keep side-effecting actions approval-gated.** Do not disable, bypass, or work
  around the approval flow. Anything that writes to external services stays gated.
- **Explain results.** After each step, briefly confirm what happened and what
  comes next. If something errors, help debug before moving on.
- **Redact secrets** in anything you echo back. Never print full keys or tokens.

Work through the steps in order:

### Step 1 — Confirm prerequisites
Verify the operator has each of these; ask them to confirm or help them install:
- **Node.js 20+** (`node -v`) and **git** (`git --version`)
- **Docker** with the compose plugin (`docker compose version`) — used for
  Postgres (and optionally the api + web containers)
- Their **OpenClaw instance** running (this dashboard is useless without it —
  it is the data source)

### Step 2 — Clone and install
```sh
git clone <repo-url> mission-control && cd mission-control
npm install
```
Confirm `npm install` finished without errors.

### Step 3 — Create the environment file
Copy the template and fill it in together:
```sh
cp apps/api/.env.example apps/api/.env
```
Go through each variable with the operator. For each one, ask them to paste the
real value, then write it into `.env` — never invent one:
- `DATABASE_URL` — Postgres connection string (the compose file provides one at
  `localhost:5432/mission_control` with the default credentials)
- `INGEST_TOKEN` — you MAY generate this one locally with
  `openssl rand -hex 24` (it is a random secret, not an account credential),
  then show it to the operator — it will also go into their OpenClaw bridge config
- `WEB_ORIGIN` — `http://localhost:5173,http://127.0.0.1:5173` (add their tunnel
  origin later if they access the dashboard remotely)
- Optional: `GITHUB_TOKEN` (enables PR approvals → auto-merge from the Approvals
  page), `DEEPSEEK_API_KEY` / `ZAI_API_KEY` (live balances on Health/Usage) — ask
  the operator to paste these only if they want those features; everything else
  works without them.

### Step 4 — Start the stack
```sh
docker compose up -d
```
Confirm all three services come up healthy (db, api, web). If they prefer running
without Docker: `npm run dev -w apps/api` and `npm run dev -w apps/web` (Postgres
still required).

### Step 5 — Verify the dashboard
Ask the operator to open `http://localhost:5173`. Confirm:
- The Overview loads and the topbar shows a green "Connected" dot (live socket)
- `/health` shows real uptime, client count, and database state
- Empty states show actions, never fake numbers

### Step 6 — Connect their OpenClaw (the bridge)
The dashboard is only as live as the data it receives. The operator's OpenClaw
instance must POST typed events to `http://127.0.0.1:3000/events` with header
`x-ingest-token: <the INGEST_TOKEN from Step 3>`. The standard pattern is a
60-second cron bridge in the OpenClaw workspace that pushes
agents/sessions/calendar/usage/approvals snapshots + run events (see the repo
README's "Event flow" section). Confirm the bridge is running and the Live
Activity band starts showing real events within a minute.

### Step 7 — Connect from another machine (optional)
If the operator wants remote access, point them at the **/connect** page in the
dashboard: it gives OS-specific SSH tunnel instructions and verifies the
connection live before handing off.

### Step 8 — Smoke test
Walk the operator through the core loops so they trust the data:
1. **Tickets:** create one → it lands in To-Do; move it Start/Done → it travels
   the kanban and persists to the activity stream.
2. **Calendar:** all their OpenClaw cron jobs are listed (weekly grid, ‹ › week
   navigation works).
3. **Office:** agents physically move between rooms when a `run.*` event fires.
4. **Live Activity:** recently run tasks show up there.

Once Step 8 passes, the install is complete. Thank the operator and summarize
what was set up, where secrets live, and what is intentionally still optional.
