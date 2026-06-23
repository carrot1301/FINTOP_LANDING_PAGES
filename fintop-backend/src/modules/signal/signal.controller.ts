import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { SignalService } from './signal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionTierGuard, SubscriptionTier } from '../../common/guards/subscription-tier.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SUBSCRIPTION_TIER, SIGNAL_STATUS } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateSignalDto, UpdateSignalStatusDto } from './dto/signal.dto';

@ApiTags('VIP Signals')
@Controller('signals')
@UseGuards(JwtAuthGuard, SubscriptionTierGuard, PermissionsGuard)
@ApiBearerAuth()
export class SignalController {
  constructor(private readonly signalService: SignalService) {}

  @Get()
  @ApiOperation({ summary: 'List available signals for user tier' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getSignals(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    const page = pagination.page ? parseInt(pagination.page as any, 10) : 1;
    const limit = pagination.limit ? parseInt(pagination.limit as any, 10) : 10;
    return this.signalService.getSignalsForUser(user.id, user.planFeatures, page, limit);
  }

  @Post()
  @Permissions('VIP_SIGNALS:CREATE')
  @ApiOperation({ summary: 'Create a new VIP Signal (Analysts only)' })
  @ApiBody({ type: CreateSignalDto })
  async createSignal(@CurrentUser() user: any, @Body() dto: CreateSignalDto) {
    return this.signalService.publishSignal({
      ...dto,
      authorId: user.id
    });
  }

  @Patch(':id/status')
  @Permissions('VIP_SIGNALS:UPDATE')
  @ApiOperation({ summary: 'Update signal status (e.g. TARGET_REACHED)' })
  @ApiBody({ type: UpdateSignalStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSignalStatusDto,
  ) {
    return this.signalService.updateSignalState(parseInt(id, 10), dto.status, dto.triggerPrice);
  }
}
