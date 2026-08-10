import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LiveActivityGateway } from './live-activity/live-activity.gateway';
import { HealthController } from './health/health.controller';
import { PrismaService } from './prisma/prisma.service';

/**
 * AppModule — root module for the Mission Control API.
 *
 * Imports stay minimal at this stage: the live activity gateway (WebSocket
 * transport for the dashboard) and the health probe. PrismaService is global
 * so future feature modules can inject it without re-importing.
 */
@Global()
@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [AppService, LiveActivityGateway, PrismaService],
  exports: [PrismaService, LiveActivityGateway],
})
export class AppModule {}
