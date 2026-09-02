/**
 * Shared API types for the Mission Control web app.
 *
 * `Agent` is the roster shape returned by the API (`GET /agents` →
 * `{ agents: Agent[] }`, `GET /agents/:id` → `{ agent: Agent & { children } }`).
 *
 * MC-200: the profile fields (emoji, personalityTags, currentTask,
 * tasksCompleted, totalCost, recentActivity, channel) are bridge-pushed and
 * every one of them may be null until the bridge supplies it — pages must
 * render unchanged/gracefully when they are (null-safe, no layout shift).
 */

export interface Agent {
  id: string
  name: string
  color: string
  role: string | null
  status: string
  parentId: string | null
  // MC-200 profile fields — nullable on the wire; default to null/0 server-side.
  emoji: string | null
  personalityTags: string[] | null
  currentTask: string | null
  tasksCompleted: number
  totalCost: number
  recentActivity: string | null
  channel: string | null
}

export interface AgentsResp {
  agents: Agent[]
  ts: number
}

export interface AgentDetailResp {
  agent: Agent & { children: Agent[] }
  ts: number
}
