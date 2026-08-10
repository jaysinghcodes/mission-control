import { Body, Controller, Headers, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { LiveActivityGateway, ActivityEventType } from '../live-activity/live-activity.gateway';

/**
 * IngestController — external event intake for the live feed.
 *
 * This is the door OpenClaw (and any other trusted producer) uses to push
 * real activity into the dashboard: producers POST a typed event, the
 * gateway broadcasts it to every connected client over Socket.IO.
 *
 * Security (vibe-dev-workflow red lines — same posture as the socket guard):
 *  - Production REQUIRES `INGEST_TOKEN` and refuses requests without a
 *    matching `x-ingest-token` header (fail closed, never an open endpoint).
 *  - Dev allows token-less calls when INGEST_TOKEN is unset (localhost dev
 *    convenience, mirrors the WebSocket gateway's dev behavior).
 *  - Event `type` is validated against the typed union — producers cannot
 *    invent arbitrary event names (GLM review 🟡 #4 posture).
 */
@Controller('events')
export class IngestController {
  constructor(private readonly gateway: LiveActivityGateway) {}

  /**
   * POST /events — accept one activity event and broadcast it to the feed.
   * Body: { type: ActivityEventType, payload?: Record<string, unknown> }
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  ingest(
    @Headers('x-ingest-token') token: string | undefined,
    @Body() body: { type?: string; payload?: Record<string, unknown> },
  ) {
    this.assertAuthorized(token);

    const type = body?.type;
    if (!type || !this.isKnownType(type)) {
      throw new HttpException(
        `unknown event type "${type ?? '(missing)'}" — allowed: ${KNOWN_TYPES.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (body.payload !== undefined && (typeof body.payload !== 'object' || body.payload === null || Array.isArray(body.payload))) {
      throw new HttpException('payload must be a JSON object', HttpStatus.BAD_REQUEST);
    }

    this.gateway.broadcast(type, { ...(body.payload ?? {}), source: 'openclaw' });
    return { accepted: true, type, ts: Date.now() };
  }

  /** Production fails closed: a missing INGEST_TOKEN means no intake at all. */
  private assertAuthorized(token: string | undefined): void {
    const expected = process.env.INGEST_TOKEN;
    if (process.env.NODE_ENV === 'production') {
      if (!expected || !token || token !== expected) {
        throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return;
    }
    // Dev: allow the token if set; otherwise allow (localhost-only posture).
    if (expected && (!token || token !== expected)) {
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  private isKnownType(type: string): type is ActivityEventType {
    return KNOWN_TYPES.includes(type as ActivityEventType);
  }
}

/** Single source of truth for accepted event names (mirrors the gateway union). */
const KNOWN_TYPES: ActivityEventType[] = [
  'run.started',
  'run.completed',
  'run.failed',
  'health.tick',
  'hello',
];
