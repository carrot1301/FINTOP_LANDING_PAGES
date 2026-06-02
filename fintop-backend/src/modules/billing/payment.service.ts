import { Injectable, Logger, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { RedisService } from '../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { BILLING_PROVIDER, INVOICE_STATUS, PAYMENT_STATUS, AUDIT_SOURCE } from '@prisma/client';
import { createHmac } from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  verifyWebhookSignature(payload: any, signature: string) {
    const secret = this.configService.get<string>('WEBHOOK_SECRET') || 'default-secret-for-dev';
    
    // Protect against replay attacks - enforce max 5 minutes old timestamp
    if (payload.timestamp) {
      const now = Date.now();
      const payloadTime = payload.timestamp;
      const fiveMinutes = 5 * 60 * 1000;
      if (Math.abs(now - payloadTime) > fiveMinutes) {
        throw new UnauthorizedException('Webhook payload timestamp expired (replay protection)');
      }
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    const expectedSignature = createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
      
    if (expectedSignature !== signature) {
      this.logger.warn(`Invalid webhook signature. Expected: ${expectedSignature}, Got: ${signature}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  async processWebhookPayment(
    provider: BILLING_PROVIDER, 
    providerId: string, 
    invoiceId: bigint, 
    amount: number, 
    idempotencyKey: string,
    planId: number,
  ) {
    // 1. Idempotency Check (Redis NX Lock)
    const lockKey = `webhook:lock:${idempotencyKey}`;
    
    try {
      const acquired = await this.redisService.getClient().set(lockKey, 'locked', 'EX', 300, 'NX');
      if (!acquired) {
        this.logger.warn(`Webhook duplicate blocked by Redis lock: ${idempotencyKey}`);
        throw new ConflictException('Concurrent webhook processing detected');
      }
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Redis set lock failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to acquire idempotency lock');
    }

    try {
      // 2. Idempotency Check (Database)
      const existingLog = await this.prisma.paymentWebhookLog.findUnique({
        where: { idempotencyKey },
      });
      if (existingLog) {
        this.logger.warn(`Webhook duplicate blocked by Database: ${idempotencyKey}`);
        return { message: 'Idempotency key already processed' };
      }

      // 3. Process Transaction with Database Transaction
      await this.prisma.$transaction(async (tx) => {
        // Record Webhook Log
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

        if (!invoice || invoice.status === INVOICE_STATUS.PAID) {
          throw new ConflictException('Invoice not found or already paid');
        }

        // Create transaction record
        await tx.transaction.create({
          data: {
            invoiceId,
            provider,
            providerId,
            amount: new Prisma.Decimal(amount),
            currency: invoice.currency,
            status: PAYMENT_STATUS.SUCCESS,
          }
        });

        // Mark invoice as PAID
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: INVOICE_STATUS.PAID },
        });

        // Activate Subscription
        await this.subscriptionService.activateSubscription(invoice.userId, planId, tx as any);

        // Outbox event for payment successful
        await tx.outboxEvent.create({
          data: {
            eventType: 'INVOICE_PAID',
            payload: { invoiceId: invoiceId.toString(), amount, provider },
            status: 'PENDING',
          }
        });
      });

      return { success: true };
    } finally {
      // Release lock
      await this.redisService.getClient().del(lockKey);
    }
  }
}
