import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Mission Control API bootstrap.
 *
 * CORS is locked to the Vite dev origin (http://localhost:5173) by default —
 * override with WEB_ORIGIN when deploying. Never use a wildcard here;
 * the dashboard is the only allowed consumer.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS is configured at BOTH layers deliberately (GLM review 🟡 #9):
  //  - enableCors() here covers HTTP REST routes (health, future CRUD)
  //  - the @WebSocketGateway decorator has its own cors for the WS handshake
  // They serve different transports; both are locked to WEB_ORIGIN, never wildcard.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  });

  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? '127.0.0.1');
  // eslint-disable-next-line no-console
  console.log(`mission-control api listening on ${process.env.HOST ?? '127.0.0.1'}:${process.env.PORT ?? 3000}`);
}
bootstrap();
