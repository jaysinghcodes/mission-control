import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaService — Prisma 7 client wired with the pg driver adapter.
 *
 * Prisma 7 requires a driver adapter (no more embedded url in schema).
 * The connection string comes from DATABASE_URL at runtime; for local dev
 * that's `postgresql://postgres:postgres@localhost:5432/mission_control`
 * (see prisma.config.ts fallback).
 *
 * Database schema is a security red line (vibe-dev-workflow): migrations are
 * human-reviewed, never auto-applied by the app.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/mission_control',
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    // Connect lazily; don't crash boot if DB is down — health endpoint reports it.
    await this.$connect().catch(() => {
      // eslint-disable-next-line no-console
      console.warn('[prisma] database unavailable — continuing (health will show degraded)');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
