import type { Agent } from '../types'
import { Bot } from './ui'

/**
 * Agent avatar — shared by the Team roster cards (MC-201) and the profile
 * drawer (MC-202). Renders `agent.emoji` when the bridge supplies it, else
 * the colored Bot glyph. MC-211: Pixel's robot avatar sprites replace the
 * emoji/Bot pair here (one swap point for both consumers).
 */
export function AgentAvatar({ agent, size = 1 }: { agent: Agent; size?: number }) {
  if (agent.emoji) {
    return (
      <span
        className="shrink-0 flex items-center justify-center rounded-md"
        style={{ width: 18 * size, height: 18 * size, fontSize: 12 * size, lineHeight: 1 }}
        aria-hidden
      >
        {agent.emoji}
      </span>
    )
  }
  return <Bot color={agent.color || 'var(--mc-primary)'} scale={size} />
}
