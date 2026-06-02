import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { SUBSCRIPTION_STATUS, AUDIT_SOURCE, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      orderBy: { price: 'asc' },
    });
  }

  async getActiveSubscription(userId: number) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });
  }

  async activateSubscription(userId: number, planId: number, transactionContext?: Prisma.TransactionClient) {
    const db = transactionContext || this.prisma;
    
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.status !== 'ACTIVE' || plan.deletedAt) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await db.userSubscription.create({
      data: {
        userId,
        planId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startDate,
        endDate,
      },
    });

    await db.user.update({
      where: { id: userId },
      data: { tierLevel: plan.tierLevel },
    });

    await db.auditLog.create({
      data: {
        userId,
        source: AUDIT_SOURCE.SYSTEM,
        action: 'SUBSCRIPTION_ACTIVATED',
        tableName: 'user_subscriptions',
        recordId: subscription.id.toString(),
        newValues: { planId, tierLevel: plan.tierLevel, endDate: endDate.toISOString() },
      }
    });

    await db.outboxEvent.create({
      data: {
        eventType: 'SUBSCRIPTION_ACTIVATED',
        payload: { userId, subscriptionId: subscription.id.toString(), tierLevel: plan.tierLevel },
        status: 'PENDING',
      }
    });

    return subscription;
  }

  async expireSubscriptions() {
    this.logger.log('Running subscription expiration job...');
    const now = new Date();

    const expiredSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { lte: now },
      },
      select: { id: true, userId: true },
    });

    if (expiredSubscriptions.length === 0) {
      return { expiredCount: 0 };
    }

    const subIds = expiredSubscriptions.map(s => s.id);
    const userIds = [...new Set(expiredSubscriptions.map(s => s.userId))];

    await this.prisma.$transaction(async (tx) => {
      // 1. Update subscriptions
      await tx.userSubscription.updateMany({
        where: { id: { in: subIds } },
        data: { status: SUBSCRIPTION_STATUS.EXPIRED },
      });

      // 2. Update users
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { tierLevel: SUBSCRIPTION_TIER.STANDARD },
      });

      // 3. Create Audit logs in batch
      await tx.auditLog.createMany({
        data: expiredSubscriptions.map(sub => ({
          userId: sub.userId,
          source: AUDIT_SOURCE.CRON,
          action: 'SUBSCRIPTION_EXPIRED',
          tableName: 'user_subscriptions',
          recordId: sub.id.toString(),
          newValues: Prisma.JsonNull,
          oldValues: Prisma.JsonNull,
        })),
      });

      // 4. Create Outbox events in batch
      await tx.outboxEvent.createMany({
        data: expiredSubscriptions.map(sub => ({
          eventType: 'SUBSCRIPTION_EXPIRED',
          payload: { userId: sub.userId, subscriptionId: sub.id.toString() },
          status: 'PENDING',
        })),
      });
    });

    this.logger.log(`Expired ${expiredSubscriptions.length} subscriptions in batch`);
    return { expiredCount: expiredSubscriptions.length };
  }
}
