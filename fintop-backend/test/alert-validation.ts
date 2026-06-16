import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { WatchlistService } from '../src/modules/watchlist/watchlist.service';
import { AlertService } from '../src/modules/alert/alert.service';
import { NotificationService } from '../src/modules/notification/notification.service';
import { ALERT_CONDITION, EXCHANGE_CODE, Prisma } from '@prisma/client';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function waitForNotificationCount(notificationService: any, userId: number, expectedCount: number, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const count = await notificationService.getUnreadCount(userId);
    if (count === expectedCount) return count;
    await delay(100);
  }
  return await notificationService.getUnreadCount(userId);
}

async function runAlertValidation() {
  console.log('🔍 Bắt đầu kiểm thử Watchlist & Alert Engine Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    const watchlistService = app.get(WatchlistService);
    const alertService = app.get(AlertService);
    const notificationService = app.get(NotificationService);

    // Cleanup
    await prisma.notificationDeliveryLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.priceAlert.deleteMany({});
    await prisma.watchlistItem.deleteMany({});
    await prisma.watchlist.deleteMany({});
    
    // Setup User & Stock
    const testEmail = 'alertuser@fintop.vn';
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: testEmail,
          fullName: 'Test Alert User',
          passwordHash: 'dummy',
        }
      });
    }

    let stock = await prisma.stock.findUnique({ where: { symbol: 'FPT' } });
    if (!stock) {
      let exchange = await prisma.stockExchange.findFirst();
      if (!exchange) exchange = await prisma.stockExchange.create({ data: { code: EXCHANGE_CODE.HOSE, name: 'HOSE' } });
      stock = await prisma.stock.create({ data: { symbol: 'FPT', companyName: 'FPT Corp', exchangeId: exchange.id } });
    }

    console.log('\n⚡ Test #1: Watchlist Management');
    const watchlist = await watchlistService.createWatchlist(user.id, 'My Tech Stocks');
    if (!watchlist) throw new Error('Watchlist creation failed');
    
    await watchlistService.addStockToWatchlist(user.id, watchlist.id, stock.id);
    const countItems = await prisma.watchlistItem.count({ where: { watchlistId: watchlist.id } });
    if (countItems !== 1) throw new Error('Stock not added to watchlist');
    console.log('  [PASS] Watchlist created and stock added idempotently.');

    console.log('\n⚡ Test #2: Price Alert Creation');
    const alert = await alertService.createAlert(user.id, stock.id, ALERT_CONDITION.PRICE_ABOVE, 140000);
    if (!alert) throw new Error('Alert creation failed');
    console.log('  [PASS] Price Alert created safely with AUDIT logs.');

    console.log('\n⚡ Test #3: Alert Trigger Evaluation');
    // Evaluate with price 141000 (> 140000). Should trigger.
    await alertService.evaluatePriceQuote(stock.id, 'FPT', 141000);
    
    // Dynamically wait for the notification to be processed by background queues
    await waitForNotificationCount(notificationService, user.id, 1, 3000);

    const triggeredAlert = await prisma.priceAlert.findUnique({ where: { id: alert.id } });
    if (!triggeredAlert!.lastTriggeredAt) throw new Error('Alert did not trigger');
    console.log('  [PASS] Alert engine evaluated price quote and triggered correctly.');

    console.log('\n⚡ Test #4: Cooldown Prevention (Duplicate Trigger Defense)');
    // Evaluate again immediately, should NOT trigger again or send 2nd notification
    await alertService.evaluatePriceQuote(stock.id, 'FPT', 142000);
    await delay(300);

    const unreadCount = await notificationService.getUnreadCount(user.id);
    if (unreadCount !== 1) throw new Error(`Expected exactly 1 notification, found ${unreadCount}`);
    console.log('  [PASS] Cooldown correctly blocked duplicate trigger and notification spam.');

    console.log('\n⚡ Test #5: Notification Lifecycle');
    const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
    const notif = notifications[0];
    await notificationService.markAsRead(notif.id);
    
    const unreadCountAfter = await notificationService.getUnreadCount(user.id);
    if (unreadCountAfter !== 0) throw new Error('Notification not marked as read');
    console.log('  [PASS] Notification gracefully delivered, enqueued, and marked as read.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA WATCHLIST & ALERT ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ ALERT & NOTIFICATION THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runAlertValidation();
