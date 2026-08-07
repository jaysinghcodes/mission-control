import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 config — connection details live here, not in schema.prisma.
 * URL comes from DATABASE_URL (see ~/.openclaw/.env / deploy env).
 * PrismaClient at runtime receives the same URL via the pg adapter
 * (see src/prisma/prisma.service.ts).
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/mission_control',
  },
});
