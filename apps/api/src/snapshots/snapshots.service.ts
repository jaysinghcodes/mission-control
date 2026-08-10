import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SnapshotsService — applies state snapshots pushed by the OpenClaw bridge.
 *
 * The bridge (an OpenClaw cron job) collects REAL state from the instance —
 * agent roster, sessions, cron jobs, usage, pending approvals — and POSTs it
 * as `*.snapshot` events. Each handler replaces the relevant table rows so
 * the dashboard always mirrors the live instance, never stale wireframes.
 */
@Injectable()
export class SnapshotsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Replace the agent roster (family tree: main on top, sub-agents below). */
  async applyAgents(payload: Record<string, unknown>): Promise<void> {
    const agents = Array.isArray(payload.agents) ? (payload.agents as Record<string, unknown>[]) : [];
    // Bridge sends parent as a NAME; the FK column needs an id, so resolve names first.
    const ids = new Map<string, string>();
    for (const a of agents) {
      ids.set(String(a.name ?? 'unknown'), randomUUID());
    }
    await this.prisma.$transaction([
      this.prisma.agent.deleteMany({}),
      ...agents.map((a) =>
        this.prisma.agent.create({
          data: {
            id: ids.get(String(a.name ?? 'unknown'))!,
            name: String(a.name ?? 'unknown'),
            color: String(a.color ?? '#58A6FF'),
            role: a.role ? String(a.role) : null,
            status: String(a.status ?? 'idle'),
            parentId: a.parent ? ids.get(String(a.parent)) ?? null : null,
          },
        }),
      ),
    ]);
  }

  /** Replace the active sessions table. */
  async applySessions(payload: Record<string, unknown>): Promise<void> {
    const sessions = Array.isArray(payload.sessions) ? (payload.sessions as Record<string, unknown>[]) : [];
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({}),
      ...sessions.map((s) =>
        this.prisma.session.create({
          data: {
            name: String(s.name ?? 'session'),
            agent: String(s.agent ?? 'main'),
            model: s.model ? String(s.model) : null,
            ctx: Number(s.ctx ?? 0),
            lastActivity: s.lastActivity ? String(s.lastActivity) : null,
            hot: Boolean(s.hot ?? false),
          },
        }),
      ),
    ]);
  }

  /** Replace the calendar (cron jobs) table. */
  async applyCalendar(payload: Record<string, unknown>): Promise<void> {
    const jobs = Array.isArray(payload.jobs) ? (payload.jobs as Record<string, unknown>[]) : [];
    await this.prisma.$transaction([
      this.prisma.cronJob.deleteMany({}),
      ...jobs.map((j) =>
        this.prisma.cronJob.create({
          data: {
            name: String(j.name ?? 'job'),
            schedule: j.schedule ? String(j.schedule) : null,
            day: j.day != null ? Number(j.day) : null,
            time: j.time ? String(j.time) : null,
            color: j.color ? String(j.color) : null,
            enabled: j.enabled !== false,
          },
        }),
      ),
    ]);
  }

  /** Upsert the usage snapshot for a period (24h | 7d | 30d | month). */
  async applyUsage(payload: Record<string, unknown>): Promise<void> {
    const period = String(payload.period ?? '24h');
    await this.prisma.usageSnapshot.upsert({
      where: { period },
      create: {
        period,
        totalCost: Number(payload.totalCost ?? 0),
        tokensIn: Number(payload.tokensIn ?? 0),
        tokensOut: Number(payload.tokensOut ?? 0),
        providers: payload.providers ?? undefined,
      },
      update: {
        totalCost: Number(payload.totalCost ?? 0),
        tokensIn: Number(payload.tokensIn ?? 0),
        tokensOut: Number(payload.tokensOut ?? 0),
        providers: payload.providers ?? undefined,
      },
    });
  }

  /** Replace pending approvals. */
  async applyApprovals(payload: Record<string, unknown>): Promise<void> {
    const approvals = Array.isArray(payload.approvals) ? (payload.approvals as Record<string, unknown>[]) : [];
    await this.prisma.$transaction([
      this.prisma.approval.deleteMany({}),
      ...approvals.map((a) =>
        this.prisma.approval.create({
          data: {
            kind: String(a.kind ?? 'exec'),
            tag: String(a.tag ?? 'Request'),
            desc: String(a.desc ?? ''),
            status: String(a.status ?? 'pending'),
          },
        }),
      ),
    ]);
  }
}
