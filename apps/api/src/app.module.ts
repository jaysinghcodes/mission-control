import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LiveActivityGateway } from './live-activity/live-activity.gateway';
import { HealthController } from './health/health.controller';
import { HealthTickerService } from './health/health.ticker';
import { IngestController } from './ingest/ingest.controller';
import { PrismaService } from './prisma/prisma.service';

/**
 * AppModule — root module for the Mission Control API.
 *
 * Imports stay minimal at this stage: the live activity gateway (WebSocket
 * transport for the dashboard), the health probe, the health ticker (periodic
 * `health.tick` broadcasts), and the ingest controller (OpenClaw → feed door).
 * PrismaService is global so future feature modules can inject it without
 * re-importing.
 */
@Global()
@Module({
  imports: [],
  controllers: [AppController, HealthController, IngestController],
  providers: [AppService, LiveActivityGateway, PrismaService, HealthTickerService],
  exports: [PrismaService, LiveActivityGateway],
})
export class AppModule {}
