"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    prisma;
    logger = new common_1.Logger(SubscriptionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlans() {
        return this.prisma.subscriptionPlan.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            orderBy: { price: 'asc' },
        });
    }
    async getActiveSubscription(userId) {
        return this.prisma.userSubscription.findFirst({
            where: {
                userId,
                status: client_1.SUBSCRIPTION_STATUS.ACTIVE,
                endDate: { gt: new Date() },
            },
            include: { plan: true },
            orderBy: { endDate: 'desc' },
        });
    }
    async activateSubscription(userId, planId, transactionContext) {
        const db = transactionContext || this.prisma;
        const plan = await db.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan || plan.status !== 'ACTIVE' || plan.deletedAt) {
            throw new common_1.NotFoundException('Subscription plan not found or inactive');
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const subscription = await db.userSubscription.create({
            data: {
                userId,
                planId,
                status: client_1.SUBSCRIPTION_STATUS.ACTIVE,
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
                source: client_1.AUDIT_SOURCE.SYSTEM,
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
                status: client_1.SUBSCRIPTION_STATUS.ACTIVE,
                isPermanent: false,
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
            await tx.userSubscription.updateMany({
                where: { id: { in: subIds } },
                data: { status: client_1.SUBSCRIPTION_STATUS.EXPIRED },
            });
            await tx.user.updateMany({
                where: { id: { in: userIds } },
                data: { tierLevel: client_1.SUBSCRIPTION_TIER.STANDARD },
            });
            await tx.auditLog.createMany({
                data: expiredSubscriptions.map(sub => ({
                    userId: sub.userId,
                    source: client_1.AUDIT_SOURCE.CRON,
                    action: 'SUBSCRIPTION_EXPIRED',
                    tableName: 'user_subscriptions',
                    recordId: sub.id.toString(),
                    newValues: client_1.Prisma.JsonNull,
                    oldValues: client_1.Prisma.JsonNull,
                })),
            });
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
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map