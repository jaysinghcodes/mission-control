import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * LiveActivityGateway — realtime event bus for Mission Control.
 *
 * Clients (the web dashboard) connect over Socket.IO and receive activity
 * events (scheduled run status, agent state changes, health ticks) without
 * polling. This is the transport PR 3 wires the frontend into.
 *
 * Security notes (vibe-dev-workflow red lines):
 *  - No auth on the socket yet: this is dev-stage. Before anything leaves
 *    localhost, the handshake must require a token (see PR roadmap / LOG.md).
 *  - No room/namespace manipulation, no raw event echoing — the gateway only
 *    emits server-authored events, never client-supplied payloads.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: false,
  },
})
export class LiveActivityGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /** Socket.IO server instance — used to broadcast to all connected clients. */
  @WebSocketServer()
  server!: Server;

  /** Track connected clients for observability (the OBSERVE lane in the UI). */
  private readonly connectedClients = new Map<string, string>(); // socketId -> lastKnownState

  /**
   * Fired on every new socket connection.
   * @param client the connecting socket
   */
  handleConnection(client: Socket): void {
    this.connectedClients.set(client.id, 'idle');
    // Tell the new client we're alive; heartbeat pattern for the UI's status dot.
    client.emit('hello', { ts: Date.now(), message: 'mission-control api connected' });
  }

  /**
   * Fired on disconnect; cleans up the client registry.
   * @param client the disconnecting socket
   */
  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
  }

  /**
   * Broadcast an activity event to every connected dashboard.
   * @param type   stable event type, e.g. 'run.started' | 'run.completed'
   * @param payload event payload (must be JSON-serializable)
   */
  broadcast(type: string, payload: Record<string, unknown>): void {
    this.server.emit(type, { ...payload, ts: Date.now() });
  }

  /** Number of currently connected dashboard clients (for /health). */
  get clientCount(): number {
    return this.connectedClients.size;
  }
}
