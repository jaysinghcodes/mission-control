import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** UsageController — real cost snapshots (synced via usage.snapshot). */
@Controller('usage')
export class UsageController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get(@Query('period') period = '24h') {
    const snap = await this.prisma.usageSnapshot.findUnique({ where: { period } });
    return { usage: snap, ts: Date.now() };
  }
}
