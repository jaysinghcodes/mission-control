import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LiveActivityGateway } from '../live-activity/live-activity.gateway';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TicketsController — Kanban + Backlog backend.
 *  - GET /tickets?status=  → todo|inprogress|done for the board, backlog for Backlog
 *  - POST /tickets         → create from the UI (empty-state CTA)
 */
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: LiveActivityGateway,
  ) {}

  @Get()
  async list(@Query('status') status?: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { tickets, ts: Date.now() };
  }

  @Post()
  async create(@Body() body: { title?: string; priority?: string; assignee?: string; tags?: string[] }) {
    const title = body?.title?.trim();
    if (!title) {
      return { error: 'title is required' };
    }
    const count = await this.prisma.ticket.count();
    const ticket = await this.prisma.ticket.create({
      data: {
        title,
        key: `MC-${150 + count}`,
        priority: body.priority ?? 'med',
        assignee: body.assignee ?? 'Jarvis Singh',
        tags: body.tags ?? [],
        status: 'backlog',
      },
    });
    this.gateway.broadcast('run.queued', { name: `ticket ${ticket.key}`, ticket: ticket.key });
    return { ticket, ts: Date.now() };
  }
}
