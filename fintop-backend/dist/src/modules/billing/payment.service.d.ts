import { PrismaService } from '../../common/database/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { RedisService } from '../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { BILLING_PROVIDER } from '@prisma/client';
import { ModuleRef } from '@nestjs/core';
export declare class PaymentService {
    private readonly prisma;
    private readonly subscriptionService;
    private readonly redisService;
    private readonly configService;
    private readonly moduleRef;
    private readonly logger;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, redisService: RedisService, configService: ConfigService, moduleRef: ModuleRef);
    verifyWebhookSignature(payload: any, signature: string): void;
    processWebhookPayment(provider: BILLING_PROVIDER, providerId: string, invoiceId: bigint, amount: number, idempotencyKey: string, planId: number): Promise<{
        message: string;
        success?: undefined;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
