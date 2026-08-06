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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
const redis_service_1 = require("../../common/redis/redis.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const client_2 = require("@prisma/client");
const core_1 = require("@nestjs/core");
let PaymentService = PaymentService_1 = class PaymentService {
    prisma;
    subscriptionService;
    redisService;
    configService;
    moduleRef;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(prisma, subscriptionService, redisService, configService, moduleRef) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.redisService = redisService;
        this.configService = configService;
        this.moduleRef = moduleRef;
    }
    verifyWebhookSignature(payload, signature) {
        const secret = this.configService.get('WEBHOOK_SECRET') || 'default-secret-for-dev';
        if (payload.timestamp) {
            const now = Date.now();
            const payloadTime = payload.timestamp;
            const fiveMinutes = 5 * 60 * 1000;
            if (Math.abs(now - payloadTime) > fiveMinutes) {
                throw new common_1.UnauthorizedException('Webhook payload timestamp expired (replay protection)');
            }
        }
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
            .update(payloadString)
            .digest('hex');
        if (expectedSignature !== signature) {
            this.logger.warn(`Invalid webhook signature. Expected: ${expectedSignature}, Got: ${signature}`);
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
    }
    async processWebhookPayment(provider, providerId, invoiceId, amount, idempotencyKey, planId) {
        const lockKey = `webhook:lock:${idempotencyKey}`;
        try {
            const acquired = await this.redisService.getClient().set(lockKey, 'locked', 'EX', 300, 'NX');
            if (!acquired) {
                this.logger.warn(`Webhook duplicate blocked by Redis lock: ${idempotencyKey}`);
                throw new common_1.ConflictException('Concurrent webhook processing detected');
            }
        }
        catch (error) {
            if (error instanceof common_1.ConflictException)
                throw error;
            this.logger.error(`Redis set lock failed: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to acquire idempotency lock');
        }
        try {
            const existingLog = await this.prisma.paymentWebhookLog.findUnique({
                where: { idempotencyKey },
            });
            if (existingLog) {
                this.logger.warn(`Webhook duplicate blocked by Database: ${idempotencyKey}`);
                return { message: 'Idempotency key already processed' };
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.paymentWebhookLog.create({
                    data: {
                        provider,
                        payload: { providerId, invoiceId: invoiceId.toString(), amount },
                        status: 'PROCESSED',
                        idempotencyKey,
                    }
                });
                const invoice = await tx.invoice.findUnique({
                    where: { id: invoiceId },
                });
                if (!invoice || invoice.status === client_1.INVOICE_STATUS.PAID) {
                    throw new common_1.ConflictException('Invoice not found or already paid');
                }
                await tx.transaction.create({
                    data: {
                        invoiceId,
                        provider,
                        providerId,
                        amount: new client_2.Prisma.Decimal(amount),
                        currency: invoice.currency,
                        status: client_1.PAYMENT_STATUS.SUCCESS,
                    }
                });
                await tx.invoice.update({
                    where: { id: invoiceId },
                    data: { status: client_1.INVOICE_STATUS.PAID },
                });
                await this.subscriptionService.activateSubscription(invoice.userId, planId, tx);
                await tx.outboxEvent.create({
                    data: {
                        eventType: 'INVOICE_PAID',
                        payload: { invoiceId: invoiceId.toString(), amount, provider },
                        status: 'PENDING',
                    }
                });
            });
            try {
                const invoice = await this.prisma.invoice.findUnique({
                    where: { id: invoiceId },
                    include: { user: true },
                });
                if (invoice && invoice.userId) {
                    const plan = await this.prisma.subscriptionPlan.findUnique({
                        where: { id: planId },
                    });
                    const tierName = plan ? plan.tierLevel : 'VIP';
                    const { NotificationService } = await import('../notification/notification.service.js');
                    const notificationService = this.moduleRef.get(NotificationService, { strict: false });
                    await notificationService.createNotification(invoice.userId, 'Nâng cấp tài khoản', `Chúc mừng! Tài khoản của bạn đã được nâng cấp lên gói ${tierName} thành công.`);
                }
            }
            catch (notifErr) {
                this.logger.warn(`Failed to create upgrade notification for invoice ${invoiceId}: ${notifErr.message}`);
            }
            return { success: true };
        }
        finally {
            await this.redisService.getClient().del(lockKey);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        redis_service_1.RedisService,
        config_1.ConfigService,
        core_1.ModuleRef])
], PaymentService);
//# sourceMappingURL=payment.service.js.map