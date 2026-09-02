import type { CSSProperties } from 'react'
import type { AvatarSize, AvatarState } from './avatarAssets'
import { resolveAvatar, spriteBodyFor, stateFor } from './avatarAssets'

/**
 * Agent avatar — Pixel's robot sprites (MC-210) wired into the app (MC-211).
 *
 * Single renderer shared by the Team roster cards + chief header (MC-201),
 * the profile drawer (MC-202) and the Office floor bots. Each roster agent
 * renders its UNIQUE robot (distinct silhouette + color identity + role cue)
 * from role-avatar-map.json; unknown/generic agents resolve through the map's
 * fallback rule (role-keyword archetype, tinted by a deterministic name hash)
 * so cloned instances render their own agents — never a crash, always a robot.
 *
 * Live status is mapped to the avatar's `data-state` (idle / working / error /
 * offline); tokens.css drives the subtle motion (idle bob, working pulse + tool
 * anims, error shake + red glow, offline grayscale) and kills every animation
 * under prefers-reduced-motion. No JS motion needed.
 *
 * API stability: callers pass `agent` + optional numeric `size` multiplier
 * (Team: 1 / 1.9, drawer: 1.8). The component accepts any object exposing the
 * agent's name/role/status (the full API Agent or the Office page's subset).
 */

/** Minimal agent shape this component consumes (structural — full Agent fits). */
export interface AvatarAgentShape {
  name?: string | null
  role?: string | null
  status?: string | null
}

/** Map the legacy numeric multiplier to the token frame sizes in tokens.css. */
const sizeToken = (size: number): AvatarSize => (size >= 2.5 ? 'lg' : size > 1 ? 'md' : 'sm')

/** Graceful emoji fallback (tiny rows) — mirrors the map's per-agent emoji. */
function EmojiFallback({ emoji, size, label }: { emoji: string; size: number; label: string }) {
  if (!emoji) return null
  return (
    <span
      role="img"
      aria-label={label}
      className="shrink-0 flex items-center justify-center rounded-md bg-mc-inner"
      style={{ width: 22 * size, height: 22 * size, fontSize: 13 * size, lineHeight: 1 }}
    >
      {emoji}
    </span>
  )
}

export function AgentAvatar({ agent, size = 1 }: { agent: AvatarAgentShape; size?: number }) {
  const resolved = resolveAvatar(agent.name, agent.role)
  const state: AvatarState = stateFor(agent.status)
  const name = agent.name?.trim() || 'agent'
  const label = `${name} avatar`
  const body = spriteBodyFor(resolved.sprite)

  // No sprite body (asset missing) → graceful emoji fallback, never a crash.
  if (!body) {
    return <EmojiFallback emoji={resolved.emoji} size={size} label={label} />
  }

  return (
    <svg
      className="mc-avatar"
      data-state={state}
      data-size={sizeToken(size)}
      viewBox="0 0 48 48"
      role="img"
      aria-label={label}
      style={{ '--avatar-accent': resolved.accent, '--avatar-accent-deep': resolved.accentDeep } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
