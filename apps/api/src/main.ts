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

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  });

  await app.listen(process.env.PORT ?? 3000);
  // eslint-disable-next-line no-console
  console.log(`mission-control api listening on :${process.env.PORT ?? 3000}`);
}
bootstrap();
