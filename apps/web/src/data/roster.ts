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
 * avatars; MC-202 will extend with the channel deep-link fallback.
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
