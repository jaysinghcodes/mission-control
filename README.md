# mission-control
# Mission Control

Command center for agent orchestration — manage work, review & gate, and observe live activity.

## Stack

- **Monorepo**: Turborepo + npm workspaces
- **Web**: React 19 + Vite + Tailwind CSS v4 (`apps/web`)
- **API**: NestJS + Socket.IO + Prisma (`apps/api`) — incoming
- **Infra (planned)**: Postgres, Redis/BullMQ, k8s-ready

## Layout

```
apps/web    React dashboard (Overview, Tasks, Live Activity…)
apps/api    NestJS backend (REST + WebSocket feed) — coming in PR 2
design/     IA flow, wireframes, design tokens (source of truth)
```

## Design system

Dark-first tokens live in `apps/web/src/index.css` (`@theme`). Full rules in the
design-studio skill: 3-lane IA (Manage Work / Review & Gate / Observe), agent
color coding, KPI cards, Live Activity band. Trend Radar stays prominent.

## Dev workflow (mandatory)

- **No direct merges to `main`** — everything lands via PR, reviewed by Jay.
- PRs are kept small (2–3 logical PRs per feature batch) for readability.
- Heavy inline comments on all new code.
- Run the development skills before committing: `vibe-dev-workflow`
  (PLAN/ACT, Design Doc, LOG.md, acceptance checklist) and
  `task-development-workflow` (TDD, task tracking, PR review).
- Security red lines from `vibe-dev-workflow`: auth, DB schema, secrets are
  human-reviewed line by line. No secrets in code, ever.

## Verify before commit

```bash
cd apps/web && npx tsc --noEmit && npm run build
cd apps/api && npm run build
```

## Roadmap PRs

1. `feat/1-web-scaffold` — monorepo + shell + tokens + Overview (this PR)
2. `feat/2-api-foundation` — NestJS, Socket.IO gateway, Prisma schema, health
3. `feat/3-live-feed` — web ↔ socket wiring, real activity feed
>>>>>>> 7fc1085 (feat(web): Overview shell with design tokens, heavy comments, README + LOG)
