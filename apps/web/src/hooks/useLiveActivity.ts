import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Live activity event shape pushed by the API gateway.
 * Mirrors the broadcast payloads from apps/api (live-activity.gateway.ts).
 */
export interface ActivityEvent {
  type: string; // e.g. 'run.started' | 'run.completed' | 'hello'
  ts: number; // server timestamp (ms epoch)
  [key: string]: unknown; // event-specific fields
}

/**
 * useLiveActivity — subscribes to the Mission Control Socket.IO feed.
 *
 * Connection lifecycle:
 *  - connects to the API (VITE_API_URL or localhost:3000) on mount
 *  - auto-reconnects on drop (socket.io built-in)
 *  - surfaces connection state so the UI can show an honest status dot
 *    (green = connected, red = disconnected — no fake "online")
 *
 * @returns { events, connected } — recent activity events + connection state
 */
export function useLiveActivity(maxEvents = 50): { events: ActivityEvent[]; connected: boolean } {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // VITE_API_URL lets the deploy env point at a real API; local dev
    // falls back to the NestJS default port. Never hardcode a prod URL.
    const socket: Socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Any server-authored event type lands here; keep the most recent N.
    const onEvent = (payload: ActivityEvent) => {
      setEvents((prev) => [payload, ...prev].slice(0, maxEvents));
    };

    // Subscribe to every event the gateway can emit. The gateway only
    // emits server-authored payloads (no client echo), so a catch-all
    // listener is safe here.
    socket.onAny((type: string, payload: unknown) => {
      onEvent({ type, ts: Date.now(), ...(typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {}) });
    });

    return () => {
      socket.disconnect();
    };
  }, [maxEvents]);

  return { events, connected };
}
