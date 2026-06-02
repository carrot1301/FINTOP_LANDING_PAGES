import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { NOTIFICATION_PRIORITY, NOTIFICATION_STATUS, NOTIFICATION_CHANNEL } from '@prisma/client';
import { NotificationGateway } from '../websocket/notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(userId: number, title: string, content: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        content,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        status: NOTIFICATION_STATUS.UNREAD,
      }
    });

    // Create delivery log for SYSTEM channel
    await this.prisma.notificationDeliveryLog.create({
      data: {
        notificationId: notification.id,
        channel: NOTIFICATION_CHANNEL.SYSTEM,
        isSuccess: true,
      }
    });

    // Invalidate user feed cache
    await this.redisService.getClient().del(`notifications:feed:${userId}`);

    // Realtime push via NotificationGateway
    try {
      this.notificationGateway.broadcastToUser(userId, {
        id: notification.id.toString(),
        title: notification.title,
        content: notification.content,
        priority: notification.priority,
        status: notification.status,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      this.logger.warn(`Could not emit realtime notification: ${err.message}`);
    }

    return notification;
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, status: NOTIFICATION_STATUS.UNREAD }
    });
  }

  async markAsRead(notificationId: bigint) {
    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NOTIFICATION_STATUS.READ }
    });

    // Invalidate cache
    await this.redisService.getClient().del(`notifications:feed:${updated.userId}`);
    return updated;
  }

  async getNotifications(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.notification.count({
      where: { userId }
    });

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const mapped = notifications.map(n => ({
      ...n,
      id: n.id.toString(),
    }));

    return {
      data: mapped,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}

