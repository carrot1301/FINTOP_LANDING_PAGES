import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { SignalService } from '../src/modules/signal/signal.service';
import { PortfolioService } from '../src/modules/portfolio/portfolio.service';
import { RedisService } from '../src/common/redis/redis.service';
import { SIGNAL_DIRECTION, SIGNAL_STATUS, EXCHANGE_CODE, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';
import { HashUtil } from '../src/common/utils/hash.util';

async function runSignalValidation() {
  console.log('🔍 Bắt đầu kiểm thử VIP Signal & Portfolio Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;
  let redisService!: RedisService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    const signalService = app.get(SignalService);
    const portfolioService = app.get(PortfolioService);
    redisService = app.get(RedisService);

    // Cleanup
    await prisma.portfolioNavSnapshot.deleteMany({});
    await prisma.portfolioHolding.deleteMany({});
    await prisma.recommendedPortfolio.deleteMany({});
    await prisma.signalExecutionLog.deleteMany({});
    await prisma.signalTarget.deleteMany({});
    await prisma.vipSignal.deleteMany({});
    
    // Test data setup
    const testEmail = 'expert@fintop.vn';
    let user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: testEmail,
          fullName: 'Test Expert',
          passwordHash: await HashUtil.hash('Password123!'),
          tierLevel: SUBSCRIPTION_TIER.DIAMOND,
        }
      });
    }

    let stock = await prisma.stock.findUnique({ where: { symbol: 'FPT' } });
    if (!stock) {
      let exchange = await prisma.stockExchange.findFirst();
      if (!exchange) {
        exchange = await prisma.stockExchange.create({ data: { code: EXCHANGE_CODE.HOSE, name: 'HOSE' } });
      }
      stock = await prisma.stock.create({
        data: { symbol: 'FPT', companyName: 'FPT Corp', exchangeId: exchange.id }
      });
    }

    console.log('\n⚡ Test #1: Publishing VIP Signal');
    const signal = await signalService.publishSignal({
      stockId: stock.id,
      authorId: user.id,
      direction: SIGNAL_DIRECTION.BUY,
      entryPrice: 130000,
      cutLossPrice: 125000,
      targetPrice: 140000,
      notes: 'Strong earnings report',
      minTierAccess: SUBSCRIPTION_TIER.GOLD,
    });

    if (signal.status !== SIGNAL_STATUS.PUBLISHED) throw new Error('Signal status is not PUBLISHED');
    console.log('  [PASS] VIP Signal successfully published and logged.');

    console.log('\n⚡ Test #2: Lifecycle State Transition (REACHED_TARGET)');
    const updatedSignal = await signalService.updateSignalState(signal.id, SIGNAL_STATUS.REACHED_TARGET, 140500);
    if (updatedSignal.status !== SIGNAL_STATUS.REACHED_TARGET) throw new Error('Signal status did not update');
    
    const logs = await prisma.signalExecutionLog.findMany({ where: { signalId: signal.id } });
    if (logs.length !== 2) throw new Error('Expected 2 execution logs (Publish, Target Hit)');
    console.log('  [PASS] Signal successfully transitioned to REACHED_TARGET with execution audit.');

    console.log('\n⚡ Test #3: Portfolio Creation');
    const portfolio = await portfolioService.createPortfolio({
      name: 'Q3 High Growth Portfolio',
      managerId: user.id,
      initialCapital: 1000000000, // 1 Billion VND
    });
    if (portfolio.cashBalance.toNumber() !== 1000000000) throw new Error('Initial capital mismatch');
    console.log('  [PASS] Portfolio created with initial capital safely.');

    console.log('\n⚡ Test #4: Portfolio Holding Allocation');
    await portfolioService.addHolding({
      portfolioId: portfolio.id,
      stockId: stock.id,
      quantity: 1000,
      avgEntryPrice: 130000,
      currentPrice: 135000,
    });
    
    const updatedPortfolio = await prisma.recommendedPortfolio.findUnique({ where: { id: portfolio.id } });
    const expectedCash = 1000000000 - (1000 * 130000); // 870M
    if (updatedPortfolio!.cashBalance.toNumber() !== expectedCash) throw new Error('Cash balance deduction incorrect');
    console.log('  [PASS] Holding added successfully and cash balance accurately deducted.');

    console.log('\n⚡ Test #5: NAV Calculation & Cache Synchronization');
    await portfolioService.calculateNav(portfolio.id);
    
    const navSnapshot = await prisma.portfolioNavSnapshot.findFirst({ where: { portfolioId: portfolio.id } });
    if (!navSnapshot) throw new Error('NAV snapshot not created');
    
    // Cash: 870M, Stocks: 1000 * 135k = 135M. Total NAV = 1005M
    if (navSnapshot.nav.toNumber() !== 1005000000) throw new Error(`NAV calculation incorrect: ${navSnapshot.nav.toNumber()}`);
    
    const cachedNav = await redisService!.getClient().get(`portfolio:nav:${portfolio.id}`);
    if (cachedNav !== '1005000000') throw new Error('Redis NAV cache out of sync');
    console.log('  [PASS] NAV accurately calculated, snapshotted immutably, and cached to Redis.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA SIGNAL & PORTFOLIO ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ SIGNAL & PORTFOLIO THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runSignalValidation();
