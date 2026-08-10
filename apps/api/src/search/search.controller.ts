import { Controller, Get, Query } from '@nestjs/common';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SearchController — global dashboard search (topbar).
 *
 * Postgres ILIKE across all live tables (case-insensitive `contains`), plus a
 * tail-grep over the real gateway log. At this dataset size this is
 * sub-millisecond with zero extra infra; if the corpus ever outgrows Postgres
 * the endpoint can be swapped to Elasticsearch/Meilisearch behind the same
 * response shape without touching the UI.
 */
@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async search(@Query('q') q?: string) {
    const query = (q ?? '').trim();
    const empty = { tasks: [], tickets: [], agents: [], sessions: [], approvals: [], activity: [], logs: [] };
    if (query.length < 2) {
      return { query, results: empty };
    }
    const like = { contains: query, mode: 'insensitive' as const };

    const [tasks, tickets, agents, sessions, approvals, activity, logs] = await Promise.all([
      this.prisma.run.findMany({ where: { OR: [{ name: like }, { agent: like }] }, orderBy: { createdAt: 'desc' }, take: 6 }),
      this.prisma.ticket.findMany({ where: { OR: [{ title: like }, { key: like }] }, orderBy: { createdAt: 'desc' }, take: 6 }),
      this.prisma.agent.findMany({ where: { OR: [{ name: like }, { role: like }] }, take: 6 }),
      this.prisma.session.findMany({ where: { OR: [{ name: like }, { agent: like }, { model: like }] }, take: 6 }),
      this.prisma.approval.findMany({ where: { OR: [{ tag: like }, { desc: like }] }, take: 6 }),
      this.prisma.activityEvent.findMany({ where: { OR: [{ type: like }, { payload: { path: ['name'], string_contains: query } }] }, orderBy: { ts: 'desc' }, take: 6 }),
      this.grepLogs(query),
    ]);

    return { query, results: { tasks, tickets, agents, sessions, approvals, activity, logs } };
  }

  /** Tail the newest gateway log and filter lines containing the query. */
  private grepLogs(query: string): { tm: string; lvl: string; msg: string }[] {
    try {
      const dir = '/tmp/openclaw';
      const candidates = readdirSync(dir)
        .filter((f) => f.startsWith('openclaw-') && f.endsWith('.log'))
        .map((f) => join(dir, f))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
      if (!candidates[0]) return [];
      const raw = readFileSync(candidates[0], 'utf8').split('\n').filter(Boolean).slice(-2000);
      return raw
        .map((line) => {
          try {
            const j = JSON.parse(line);
            return {
              tm: typeof j.time === 'string' ? j.time.slice(11, 19) : '',
              lvl: String(j._meta?.logLevelName ?? 'INFO'),
              msg: String(j.message ?? line),
            };
          } catch {
            return { tm: '', lvl: 'INFO', msg: line };
          }
        })
        .filter((l) => l.msg.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6);
    } catch {
      return [];
    }
  }
}
