import { HealthController } from './health.controller';
import { LiveActivityGateway } from '../live-activity/live-activity.gateway';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Unit tests for HealthController (GLM review 🟡 #11).
 * Prisma + gateway are mocked — we only assert the response shape.
 */
describe('HealthController', () => {
  let controller: HealthController;
  let gateway: { clientCount: number };
  let prisma: { dbReady: boolean };

  beforeEach(() => {
    gateway = { clientCount: 3 };
    prisma = { dbReady: true };
    controller = new HealthController(
      gateway as unknown as LiveActivityGateway,
      prisma as unknown as PrismaService,
    );
  });

  it('reports ok when the database is reachable', () => {
    const res = controller.getHealth();

    expect(res.status).toBe('ok');
    expect(res.database).toBe('connected');
    expect(res.connectedClients).toBe(3);
    expect(res.uptimeSeconds).toEqual(expect.any(Number));
    expect(res.ts).toEqual(expect.any(Number));
  });

  it('reports degraded when the database is down (no fake 100%)', () => {
    prisma.dbReady = false;
    const res = controller.getHealth();

    expect(res.status).toBe('degraded');
    expect(res.database).toBe('unavailable');
  });
});
