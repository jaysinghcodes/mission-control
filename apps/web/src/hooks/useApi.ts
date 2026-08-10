import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useApi — tiny fetch hook for the Mission Control API.
 * - data/loading/error states, refetch()
 * - optional pollMs for auto-refresh (logs, sessions, …)
 * - never throws: on failure it surfaces `error: true` so pages can render
 *   their empty state / offline notice instead of crashing.
 */
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function useApi<T>(path: string, opts: { pollMs?: number } = {}): {
  data: T | null
  loading: boolean
  error: boolean
  refetch: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const pollMs = opts.pollMs ?? 0
  const pathRef = useRef(path)
  pathRef.current = path

  const refetch = useCallback(async () => {
    try {
      const res = await fetch(`${API}${pathRef.current}`)
      if (!res.ok) throw new Error(String(res.status))
      setData((await res.json()) as T)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
    if (pollMs > 0) {
      const t = setInterval(() => void refetch(), pollMs)
      return () => clearInterval(t)
    }
  }, [refetch, pollMs])

  return { data, loading, error, refetch }
}

/** POST helper for creating resources (tasks, tickets, decisions). */
export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
