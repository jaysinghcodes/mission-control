import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

/**
 * IngestController e2e-style tests (supertest against the real module).
 *
 * Scope: auth guard + event validation on POST /events. Broadcast behavior
 * itself is covered by the gateway spec; here we prove the door is locked
 * in production and rejects unknown types.
 */
describe('IngestController (POST /events)', () => {
  let app: INestApplication;
  const savedEnv = { ...process.env };

  beforeEach(async () => {
    jest.resetModules();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    process.env = { ...savedEnv };
    await app.close();
  });

  it('rejects unknown event types', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .send({ type: 'not.a.real.event' });
    expect(res.status).toBe(400);
  });

  it('accepts a known event type in dev (no token required when INGEST_TOKEN unset)', async () => {
    delete process.env.INGEST_TOKEN;
    process.env.NODE_ENV = 'development';
    const res = await request(app.getHttpServer())
      .post('/events')
      .send({ type: 'run.started', payload: { name: 'Morning Brief' } });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });

  it('fails closed in production without a token', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INGEST_TOKEN = 'secret';
    const res = await request(app.getHttpServer())
      .post('/events')
      .send({ type: 'run.started' });
    expect(res.status).toBe(401);
  });

  it('accepts a valid token in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INGEST_TOKEN = 'secret';
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('x-ingest-token', 'secret')
      .send({ type: 'health.tick' });
    expect(res.status).toBe(202);
  });
});
