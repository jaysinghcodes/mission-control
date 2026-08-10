import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AgentsController — the real agent roster (synced from OpenClaw via
 * agents.snapshot). Returns the family tree: main agent on top, sub-agents
 * linked by parentId.
 */
@Controller('agents')
export class AgentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const agents = await this.prisma.agent.findMany({ orderBy: { updatedAt: 'desc' } });
    return { agents, ts: Date.now() };
  }
}
