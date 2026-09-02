/**
 * Approved roster identity map — MC-201 (docs/p0-tickets.md, Epic MC-A).
 *
 * Jay-approved "Meet the Team" identities: the roster agents get human names
 * and role labels instead of process-y lane names. This file is the DISPLAY
 * layer only — it never decides *who* is on the team (that always comes from
 * GET /agents), it only decides how an agent's name/role reads on the Team
 * page. Matches are defensive (case/separator-insensitive) so whatever the
 * bridge pushes — `role: "development"`, `role: "Dev"`, name "Nova", … —
 * resolves to the same card identity.
 *
 * Roster (locked):
 *   Jarvis   → Chief of Staff (keeps name)
 *   Atlas    → Scrum Master   (scrummaster)
 *   Nova     → Development    (development)
 *   Nox      → QA             (qa)
 *   Sage     → Research       (research)
 *   Pixel    → Design         (design)
 *   Scribe   → Summary        (summary)
 *   Sentinel → Alerts         (alerts)
 *
 * MC-211 will consume the same identities when it wires Pixel's robot
 * avatars. MC-202 adds the channel deep-link helper below.
 */

export interface RosterIdentity {
  /** Human-facing display name (Jarvis, Atlas, Nova, …). */
  name: string
  /** Human-facing role label (Chief of Staff, Scrum Master, Development, …). */
  role: string
}

interface RosterEntry extends RosterIdentity {
  /** Lane keys matched against the normalized agent role. */
  roleKeys: string[]
  /** Roster names matched against the normalized agent name. */
  nameKeys: string[]
}

export const ROSTER: RosterEntry[] = [
  {
    name: 'Jarvis', role: 'Chief of Staff',
    roleKeys: ['chief of staff', 'chief-of-staff', 'main agent', 'operator', 'main'],
    nameKeys: ['jarvis'],
  },
  {
    name: 'Atlas', role: 'Scrum Master',
    roleKeys: ['scrum master', 'scrummaster', 'scrum-master'],
    nameKeys: ['atlas'],
  },
  {
    name: 'Nova', role: 'Development',
    roleKeys: ['development', 'developer', 'dev'],
    nameKeys: ['nova'],
  },
  {
    name: 'Nox', role: 'QA',
    roleKeys: ['qa', 'quality assurance'],
    nameKeys: ['nox'],
  },
  {
    name: 'Sage', role: 'Research',
    roleKeys: ['research', 'researcher'],
    nameKeys: ['sage'],
  },
  {
    name: 'Pixel', role: 'Design',
    roleKeys: ['design', 'designer'],
    nameKeys: ['pixel'],
  },
  {
    name: 'Scribe', role: 'Summary',
    roleKeys: ['summary', 'summarizer', 'scribe'],
    nameKeys: ['scribe'],
  },
  {
    name: 'Sentinel', role: 'Alerts',
    roleKeys: ['alerts', 'alert', 'watchtower', 'sentinel'],
    nameKeys: ['sentinel'],
  },
]

/** Lowercase + collapse separators so matching is punctuation-insensitive. */
const norm = (s: string | null | undefined): string =>
  (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** True when the API name is a generic placeholder (spawned sub-agent etc.). */
const isGenericName = (name: string | null | undefined): boolean => {
  const n = norm(name)
  if (!n) return true
  return n === 'main' || n.startsWith('subagent') || n.startsWith('sub agent') || /^agent\b/.test(n)
}

/**
 * Resolve an agent's roster identity from its API `name` + `role`.
 * Returns null when the agent is not one of the approved roster members —
 * callers then render the raw API name/role (shape-tolerant, never guessed).
 */
export function rosterIdentity(name: string | null | undefined, role: string | null | undefined): RosterIdentity | null {
  const n = norm(name)
  const r = norm(role)
  for (const entry of ROSTER) {
    // Role keys take precedence (lane is the stable identity the bridge pushes),
    // then the roster name — but never match against a generic spawn name.
    if (entry.roleKeys.some((k) => r === norm(k) || r.includes(norm(k)))) {
      return { name: entry.name, role: entry.role }
    }
    if (!isGenericName(n) && entry.nameKeys.some((k) => n === norm(k) || n.includes(norm(k)))) {
      return { name: entry.name, role: entry.role }
    }
  }
  return null
}

/**
 * Human-facing display for a roster card: identity name when the API name is
 * generic (e.g. "Subagent · 94ce5523" in the development lane), otherwise the
 * agent's real API name (Jarvis Singh keeps his full name). Role label always
 * comes from the identity when matched; callers fall back to `role ?? 'agent'`
 * when there is no match (MC-201 acceptance: role title fallback "agent").
 */
export function rosterDisplayName(name: string | null | undefined, role: string | null | undefined): string {
  const identity = rosterIdentity(name, role)
  if (!identity) return name?.trim() || 'agent'
  return isGenericName(name) ? identity.name : name!.trim()
}

/* ------------------------------------------------------------------ */
/* MC-202 — per-agent Discord deep link                                */
/* ------------------------------------------------------------------ */

/**
 * Discord guild hosting the roster channels (Sage's deep-links research,
 * `research/deep-links-chat.md`). Canonical deep-link shape:
 * `https://discord.com/channels/<guild>/<channel>` — a thread's snowflake
 * goes in the same slot, so no shape change is ever needed for threads.
 */
export const DISCORD_GUILD = '1361917070358347967'

/**
 * Static name → Discord channel snowflake fallback (MC-202 AC #4).
 *
 * Used ONLY while the OpenClaw bridge does not supply `agent.channel` — the
 * agent's own `channel` field always wins (AC #3). Snowflakes verified
 * 2026-09-02 against the live session keys in
 * `~/.openclaw/agents/main/sessions/sessions.json` (each Discord channel
 * session key is `agent:main:discord:channel:<snowflake>`; the trailing
 * segment is the channel id — Sage's research). Keys are normalized
 * (case/separator-insensitive) roster names + the chief's API name.
 */
export const CHANNEL_FALLBACK: Record<string, string> = {
  'jarvis': '1533634789901471805',      // #general
  'jarvis singh': '1533634789901471805', // #general (chief's raw API name)
  'atlas': '1544192564280950794',       // #scrummaster
  'nova': '1535129332442341489',        // #development
  'nox': '1543846101260697620',         // #qa
  'sage': '1533676159106289675',        // #research
  'pixel': '1534416808042299444',       // #design
  'scribe': '1544194893423968376',      // #summary
  'sentinel': '1533669990673285141',    // #alerts
}

/**
 * Resolve an agent's canonical Discord channel URL, or null when the agent
 * has no reachable channel.
 *
 * Priority (Sage's research §3):
 *  1. `channel` — the bridge's source of truth. Accepts either the full
 *     canonical URL or a bare snowflake (both are wrapped/kept as-is).
 *  2. Otherwise the static CHANNEL_FALLBACK map (roster display name).
 *  3. Nothing usable → null: callers HIDE the link — never a dead link,
 *     never `<#id>` mentions, never a URL guessed from a channel name.
 */
export function channelHref(channel: string | null | undefined, name: string | null | undefined): string | null {
  const v = (channel ?? '').trim()
  if (/^https?:\/\//i.test(v)) return v // full canonical URL from the bridge
  if (/^\d{17,21}$/.test(v)) return `https://discord.com/channels/${DISCORD_GUILD}/${v}` // bare snowflake
  // A present-but-unusable channel (e.g. a <#id> mention) → hide, never fall
  // back and never render a dead/broken link (Sage's research §3).
  if (v) return null
  // Absent → documented roster fallback keyed by the display name.
  const n = norm(name)
  const snowflake = n ? (CHANNEL_FALLBACK[n] ?? null) : null
  return snowflake ? `https://discord.com/channels/${DISCORD_GUILD}/${snowflake}` : null
}
