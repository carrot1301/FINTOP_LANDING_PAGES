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
var AlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
const notification_queue_1 = require("../notification/notification.queue");
let AlertService = AlertService_1 = class AlertService {
    prisma;
    redisService;
    auditService;
    notificationQueue;
    logger = new common_1.Logger(AlertService_1.name);
    constructor(prisma, redisService, auditService, notificationQueue) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.auditService = auditService;
        this.notificationQueue = notificationQueue;
    }
    async createAlert(userId, stockId, condition, targetValue) {
        const alert = await this.prisma.priceAlert.create({
            data: {
                userId,
                stockId,
                condition,
                targetValue: new client_1.Prisma.Decimal(targetValue),
            }
        });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'ALERT_CREATED',
            tableName: 'price_alerts',
            recordId: alert.id.toString(),
        });
        await this.redisService.getClient().sadd(`alerts:active:stock:${stockId}`, alert.id);
        return alert;
    }
    async evaluatePriceQuote(stockId, symbol, currentPrice) {
        const activeAlerts = await this.prisma.priceAlert.findMany({
            where: { stockId, status: client_1.ALERT_STATUS.ACTIVE },
        });
        for (const alert of activeAlerts) {
            let triggered = false;
            if (alert.lastTriggeredAt) {
                const diffMins = (Date.now() - alert.lastTriggeredAt.getTime()) / 60000;
                if (diffMins < alert.cooldownMinutes)
                    continue;
            }
            const targetValue = alert.targetValue.toNumber();
            switch (alert.condition) {
                case client_1.ALERT_CONDITION.PRICE_ABOVE:
                    if (currentPrice >= targetValue)
                        triggered = true;
                    break;
                case client_1.ALERT_CONDITION.PRICE_BELOW:
                    if (currentPrice <= targetValue)
                        triggered = true;
                    break;
                default:
                    break;
            }
            if (triggered) {
                await this.triggerAlert(alert.id, symbol, currentPrice);
            }
        }
    }
    async triggerAlert(alertId, symbol, currentPrice) {
        const updated = await this.prisma.priceAlert.update({
            where: { id: alertId },
            data: {
                lastTriggeredAt: new Date(),
            },
            include: { user: true }
        });
        await this.auditService.log({
            userId: updated.userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
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
    async getUserAlerts(userId) {
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
    async deleteAlert(userId, alertId) {
        const alert = await this.prisma.priceAlert.findUnique({ where: { id: alertId } });
        if (!alert || alert.userId !== userId)
            throw new common_1.NotFoundException('Alert not found');
        await this.prisma.priceAlert.delete({ where: { id: alertId } });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'ALERT_DELETED',
            tableName: 'price_alerts',
            recordId: alertId.toString(),
        });
        await this.redisService.getClient().srem(`alerts:active:stock:${alert.stockId}`, alert.id);
        return { success: true };
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        audit_service_1.AuditService,
        notification_queue_1.NotificationQueue])
], AlertService);
//# sourceMappingURL=alert.service.js.map