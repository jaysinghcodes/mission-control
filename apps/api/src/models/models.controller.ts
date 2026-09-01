import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ModelsController — user-configured models for usage tracking.
 *
 * The Usage page "+" flow: the user adds a provider+model they want to track
 * (e.g. deepseek/deepseek-v4-flash, zai/glm-5.2). The bridge cron reads this
 * list and fetches a live balance/usage per configured model, which then
 * shows up in /usage and the Health provider cards.
 */
@Controller('models')
export class ModelsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.modelConfig.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Post()
  async create(@Body() body: { provider?: string; model?: string; label?: string }) {
    const provider = String(body.provider ?? '').trim().toLowerCase();
    const model = String(body.model ?? '').trim();
    if (!provider || !model) {
      throw new HttpException('provider and model are required', HttpStatus.BAD_REQUEST);
    }
    if (!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(model)) {
      throw new HttpException('invalid model id', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.modelConfig.create({
      data: {
        provider,
        model,
        label: body.label ? String(body.label).trim().slice(0, 60) || null : null,
      },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.prisma.modelConfig.delete({ where: { id } });
    } catch {
      throw new HttpException('model not found', HttpStatus.NOT_FOUND);
    }
    return { deleted: id };
  }
}
