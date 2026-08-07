import { LiveActivityGateway } from './live-activity.gateway';
import { Server, Socket } from 'socket.io';

/**
 * Unit tests for LiveActivityGateway (GLM review 🟡 #11 — zero coverage).
 * Uses a minimal fake socket; no real network involved.
 */
describe('LiveActivityGateway', () => {
  let gateway: LiveActivityGateway;

  beforeEach(() => {
    gateway = new LiveActivityGateway();
    gateway.server = { emit: jest.fn() } as unknown as Server;
    process.env.NODE_ENV = 'test';
  });

  /** Build a fake socket with the pieces handleConnection touches. */
  function fakeSocket(overrides: Partial<Socket> = {}): Socket {
    return {
      id: `socket-${Math.random()}`,
      handshake: { auth: {} },
      emit: jest.fn(),
      disconnect: jest.fn(),
      ...overrides,
    } as unknown as Socket;
  }

  it('registers a client on connection and greets it', () => {
    const client = fakeSocket();
    gateway.handleConnection(client);

    expect(gateway.clientCount).toBe(1);
    expect(client.emit).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ message: 'mission-control api connected' }),
    );
  });

  it('removes the client on disconnect', () => {
    const client = fakeSocket();
    gateway.handleConnection(client);
    expect(gateway.clientCount).toBe(1);

    gateway.handleDisconnect(client);
    expect(gateway.clientCount).toBe(0);
  });

  it('broadcasts typed events with a server timestamp', () => {
    gateway.broadcast('run.started', { name: 'Trend Radar' });

    expect(gateway.server.emit).toHaveBeenCalledWith(
      'run.started',
      expect.objectContaining({ name: 'Trend Radar', ts: expect.any(Number) }),
    );
  });

  it('rejects unauthenticated connections in production', () => {
    process.env.NODE_ENV = 'production';
    const client = fakeSocket();

    gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(gateway.clientCount).toBe(0);
  });

  it('accepts connections with a valid token in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.SOCKET_TOKEN = 'secret-token';
    const client = fakeSocket({ handshake: { auth: { token: 'secret-token' } } });

    gateway.handleConnection(client);

    expect(client.disconnect).not.toHaveBeenCalled();
    expect(gateway.clientCount).toBe(1);
    delete process.env.SOCKET_TOKEN;
  });
});
