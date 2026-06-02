import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { ALERT_CONDITION, ALERT_STATUS, AUDIT_SOURCE, Prisma } from '@prisma/client';
import { NotificationQueue } from '../notification/notification.queue';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async createAlert(userId: number, stockId: number, condition: ALERT_CONDITION, targetValue: number) {
    const alert = await this.prisma.priceAlert.create({
      data: {
        userId,
        stockId,
        condition,
        targetValue: new Prisma.Decimal(targetValue),
      }
    });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'ALERT_CREATED',
      tableName: 'price_alerts',
      recordId: alert.id.toString(),
    });

    await this.redisService.getClient().sadd(`alerts:active:stock:${stockId}`, alert.id);
    
    return alert;
  }

  async evaluatePriceQuote(stockId: number, symbol: string, currentPrice: number) {
    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: { stockId, status: ALERT_STATUS.ACTIVE },
    });

    for (const alert of activeAlerts) {
      let triggered = false;
      
      if (alert.lastTriggeredAt) {
        const diffMins = (Date.now() - alert.lastTriggeredAt.getTime()) / 60000;
        if (diffMins < alert.cooldownMinutes) continue;
      }

      const targetValue = alert.targetValue.toNumber();
      
      switch (alert.condition) {
        case ALERT_CONDITION.PRICE_ABOVE:
          if (currentPrice >= targetValue) triggered = true;
          break;
        case ALERT_CONDITION.PRICE_BELOW:
          if (currentPrice <= targetValue) triggered = true;
          break;
        default:
          break;
      }

      if (triggered) {
        await this.triggerAlert(alert.id, symbol, currentPrice);
      }
    }
  }

  private async triggerAlert(alertId: number, symbol: string, currentPrice: number) {
    const updated = await this.prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        lastTriggeredAt: new Date(),
      },
      include: { user: true }
    });

    await this.auditService.log({
      userId: updated.userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'ALERT_TRIGGERED',
      tableName: 'price_alerts',
      recordId: alertId.toString(),
    });

    await this.notificationQueue.enqueue({
      userId: updated.userId,
      title: `${symbol} Alert Triggered`,
      content: `The price for ${symbol} reached ${currentPrice}. Condition: ${updated.condition} ${updated.targetValue}.`,
    });
  }

  async getUserAlerts(userId: number) {
    const alerts = await this.prisma.priceAlert.findMany({
      where: { userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' }
    });
    return alerts.map(a => ({
      ...a,
      targetValue: a.targetValue.toNumber(),
    }));
  }

  async deleteAlert(userId: number, alertId: number) {
    const alert = await this.prisma.priceAlert.findUnique({ where: { id: alertId } });
    if (!alert || alert.userId !== userId) throw new NotFoundException('Alert not found');

    await this.prisma.priceAlert.delete({ where: { id: alertId } });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'ALERT_DELETED',
      tableName: 'price_alerts',
      recordId: alertId.toString(),
    });

    await this.redisService.getClient().srem(`alerts:active:stock:${alert.stockId}`, alert.id);
    return { success: true };
  }
}
