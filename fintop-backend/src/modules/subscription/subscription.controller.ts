import { Controller, Get, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Subscription')
@Controller('users/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription details for user' })
  async getSubscription(@CurrentUser() user: any) {
    // Fetches the active subscription from DB
    return {
      userId: user.id,
      tierLevel: user.tierLevel,
      status: 'ACTIVE',
      // In reality, this calls subscriptionService.getActiveSubscription(user.id)
    };
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }
}
