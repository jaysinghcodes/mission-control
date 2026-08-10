import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LiveActivityGateway } from '../live-activity/live-activity.gateway';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ApprovalsController — Review & Gate lane.
 *  - GET /approvals              → pending requests (synced via approvals.snapshot)
 *  - POST /approvals/:id/decide  → approve/reject (broadcasts approval.decided;
 *    the OpenClaw bridge executes the decision against the gateway)
 */
@Controller('approvals')
export class ApprovalsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: LiveActivityGateway,
  ) {}

  @Get()
  async list() {
    const approvals = await this.prisma.approval.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
    return { approvals, ts: Date.now() };
  }

  @Post(':id/decide')
  async decide(@Param('id') id: string, @Body() body: { action?: 'approve' | 'reject' }) {
    const action = body?.action;
    if (action !== 'approve' && action !== 'reject') {
      return { error: 'action must be approve or reject' };
    }
    const existing = await this.prisma.approval.findUnique({ where: { id } });
    if (!existing) {
      return { error: 'approval not found' };
    }
    const approval = await this.prisma.approval.update({
      where: { id },
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
    });
    this.gateway.broadcast('approval.decided', {
      id: approval.id,
      desc: approval.desc,
      action,
      status: approval.status,
    });
    return { approval, ts: Date.now() };
  }
}
