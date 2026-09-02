import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AgentsController — the real agent roster (synced from OpenClaw via
 * agents.snapshot). Returns the family tree: main agent on top, sub-agents
 * linked by parentId.
 *
 * MC-200: list responses carry the new profile fields (emoji, personalityTags,
 * currentTask, tasksCompleted, totalCost, recentActivity, channel); the detail
 * endpoint GET /agents/:id returns one agent plus its children.
 */
@Controller('agents')
export class AgentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const agents = await this.prisma.agent.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return { agents, ts: Date.now() };
  }

  /**
   * GET /agents/:id — one agent with its children (parentId relation).
   *
   * :id accepts the agent's stable NAME as a fallback: snapshot ids are
   * randomUUIDs that are re-rolled on every bridge push, so id-based deep
   * links would rot between snapshots. Names are unique + stable — profile
   * drawers / deep links (MC-202) should link by name.
   */
  @Get(':id')
  async one(@Param('id') id: string) {
    const withChildren = (where: { id: string } | { name: string }) =>
      this.prisma.agent.findUnique({
        where,
        include: { children: { orderBy: { name: 'asc' } } },
      });

    const agent =
      (await withChildren({ id })) ?? (await withChildren({ name: id }));
    if (!agent) {
      throw new NotFoundException(`agent "${id}" not found`);
    }
    return { agent, ts: Date.now() };
  }
}
