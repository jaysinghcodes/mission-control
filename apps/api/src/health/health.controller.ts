import { Controller, Get } from '@nestjs/common';
import { LiveActivityGateway } from '../live-activity/live-activity.gateway';

/**
 * HealthController — liveness/readiness probe for the API.
 *
 * Mission Control's OBSERVE lane shows real health values (never fake 100%):
 * this endpoint reports process uptime and live socket client count so the
 * dashboard has honest data to render.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly gateway: LiveActivityGateway) {}

  /**
   * GET /health — basic liveness.
   * Returns status, uptime seconds, and connected dashboard clients.
   */
  @Get()
  getHealth() {
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      connectedClients: this.gateway.clientCount,
      ts: Date.now(),
    };
  }
}
