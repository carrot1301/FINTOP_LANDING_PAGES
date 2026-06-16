import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { InvoiceService } from '../src/modules/billing/invoice.service';
import { PaymentService } from '../src/modules/billing/payment.service';
import { SubscriptionService } from '../src/modules/subscription/subscription.service';
import { HashUtil } from '../src/common/utils/hash.util';
import { BILLING_PROVIDER, SUBSCRIPTION_TIER, SUBSCRIPTION_STATUS, INVOICE_STATUS } from '@prisma/client';

async function runBillingValidation() {
  console.log('🔍 Bắt đầu kiểm thử Subscription & Billing Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    const invoiceService = app.get(InvoiceService);
    const paymentService = app.get(PaymentService);
    const subscriptionService = app.get(SubscriptionService);

    const testEmail = 'test_billing@fintop.vn';
    const testPassword = 'Password123!';
    const passwordHash = await HashUtil.hash(testPassword);
    
    const testUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (testUser) {
      await prisma.auditLog.deleteMany({ where: { userId: testUser.id } });
      await prisma.transaction.deleteMany({
        where: {
          invoice: {
            userId: testUser.id
          }
        }
      });
      await prisma.invoice.deleteMany({ where: { userId: testUser.id } });
      await prisma.userSubscription.deleteMany({ where: { userId: testUser.id } });
    }
    
    await prisma.subscriptionPlan.deleteMany({ where: { name: 'Gold Monthly' } });
    await prisma.paymentWebhookLog.deleteMany({});
    await prisma.outboxEvent.deleteMany({});
    await prisma.user.deleteMany({ where: { email: testEmail } });

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Test User Billing',
        passwordHash,
        status: 'ACTIVE',
        tierLevel: 'STANDARD',
      },
    });

    console.log('\n⚡ Test #1: Creating Subscription Plan');
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Gold Monthly',
        tierLevel: SUBSCRIPTION_TIER.GOLD,
        price: 500000,
        currency: 'VND',
        durationDays: 30,
      }
    });
    console.log('  [PASS] Subscription Plan created.');

    console.log('\n⚡ Test #2: Create Subscription Invoice');
    const { invoice } = await invoiceService.createSubscriptionInvoice(user.id, plan.id);
    if (invoice.status !== INVOICE_STATUS.DRAFT) throw new Error('Invoice should be DRAFT');
    console.log('  [PASS] Invoice created correctly.');

    console.log('\n⚡ Test #3: Payment Webhook Processing & Idempotency');
    const idempotencyKey = `test_webhook_${Date.now()}`;
    
    await paymentService.processWebhookPayment(
      BILLING_PROVIDER.VIETQR,
      'BANK_TXN_123',
      invoice.id,
      500000,
      idempotencyKey,
      plan.id
    );
    console.log('  [PASS] First webhook processed successfully.');

    const duplicateRes = await paymentService.processWebhookPayment(
      BILLING_PROVIDER.VIETQR,
      'BANK_TXN_123',
      invoice.id,
      500000,
      idempotencyKey,
      plan.id
    );
    if (duplicateRes.message !== 'Idempotency key already processed') {
      throw new Error('Idempotency protection failed');
    }
    console.log('  [PASS] Duplicate webhook gracefully rejected (Idempotency OK).');

    console.log('\n⚡ Test #4: Verify Database Integrity After Payment');
    const paidInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    if (paidInvoice?.status !== INVOICE_STATUS.PAID) throw new Error('Invoice not marked as PAID');
    
    const activeSub = await subscriptionService.getActiveSubscription(user.id);
    if (!activeSub) throw new Error('Subscription not activated');
    if (activeSub.status !== SUBSCRIPTION_STATUS.ACTIVE) throw new Error('Subscription status not ACTIVE');

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (updatedUser?.tierLevel !== SUBSCRIPTION_TIER.GOLD) throw new Error('User tierLevel not upgraded');

    const outboxEvents = await prisma.outboxEvent.findMany();
    if (outboxEvents.length !== 2) throw new Error('Expected 2 OutboxEvents (SUBSCRIPTION_ACTIVATED, INVOICE_PAID)');

    console.log('  [PASS] Invoice PAID, Subscription ACTIVE, User upgraded to GOLD, Outbox generated.');

    console.log('\n⚡ Test #5: Automated Expiration Cron Job');
    await prisma.userSubscription.update({
      where: { id: activeSub.id },
      data: { endDate: new Date(Date.now() - 86400000) }
    });

    const expireRes = await subscriptionService.expireSubscriptions();
    if (expireRes.expiredCount !== 1) throw new Error('Expected 1 subscription to expire');

    const expiredSub = await prisma.userSubscription.findUnique({ where: { id: activeSub.id } });
    if (expiredSub?.status !== SUBSCRIPTION_STATUS.EXPIRED) throw new Error('Subscription not EXPIRED');

    const downgradedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (downgradedUser?.tierLevel !== SUBSCRIPTION_TIER.STANDARD) throw new Error('User not downgraded to STANDARD');

    console.log('  [PASS] Expiration processed, User downgraded to STANDARD.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA BILLING ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ BILLING THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runBillingValidation();
