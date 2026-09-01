import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { webOrigins } from './cors-origins';

/**
 * Mission Control API bootstrap.
 *
 * CORS is locked to the Vite dev origins (localhost AND 127.0.0.1 — the
 * tunnel can present either) by default; override with a comma-separated
 * WEB_ORIGIN when deploying. Never use a wildcard here; the dashboard is
 * the only allowed consumer.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS is configured at BOTH layers deliberately (GLM review 🟡 #9):
  //  - enableCors() here covers HTTP REST routes (health, future CRUD)
  //  - the @WebSocketGateway decorator has its own cors for the WS handshake
  // They serve different transports; both are locked to the WEB_ORIGIN list, never wildcard.
  app.enableCors({
    origin: webOrigins(),
  });

  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '127.0.0.1');
  // eslint-disable-next-line no-console
  console.log(`mission-control api listening on ${process.env.HOST ?? '127.0.0.1'}:${process.env.PORT ?? 3000}`);
}
bootstrap();
