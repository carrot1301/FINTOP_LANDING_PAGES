import { Controller, Get, Patch, UseGuards, Query, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('User Notifications')
@Controller('users/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNotifications(@CurrentUser() user: any, @Query() pagination: PaginationDto) {
    const page = pagination.page ? parseInt(pagination.page as any, 10) : 1;
    const limit = pagination.limit ? parseInt(pagination.limit as any, 10) : 10;
    return this.notificationService.getNotifications(user.id, page, limit);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    const result = await this.notificationService.markAsRead(BigInt(id));
    return {
      message: 'Notification marked as read',
      notificationId: id,
      status: result.status
    };
  }
}

