import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { MarketService } from '../src/modules/market/market.service';
import { MarketSyncService } from '../src/modules/ingestion/market-sync.service';
import { RedisService } from '../src/common/redis/redis.service';
import { EXCHANGE_CODE } from '@prisma/client';
import { MockMarketAdapter } from '../src/modules/ingestion/mock-market-adapter';

async function runMarketValidation() {
  console.log('🔍 Bắt đầu kiểm thử Market Data Foundation Runtime Validation...');

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
    const marketService = app.get(MarketService);
    const marketSyncService = app.get(MarketSyncService);
    redisService = app.get(RedisService);

    // Cleanup FPT specific test records safely
    await prisma.vipSignal.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.portfolioHolding.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.watchlistItem.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.priceAlert.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.financialIndicator.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.stockPriceDaily.deleteMany({ where: { stock: { symbol: 'FPT' } } });
    await prisma.stock.deleteMany({
      where: {
        OR: [
          { symbol: 'FPT' },
          { industry: { code: 'SOFT' } },
          { industry: { sector: { code: 'TECH' } } }
        ]
      }
    });
    await prisma.industry.deleteMany({
      where: {
        OR: [
          { code: 'SOFT' },
          { sector: { code: 'TECH' } }
        ]
      }
    });
    await prisma.sector.deleteMany({ where: { code: 'TECH' } });
    await prisma.marketDataSyncLog.deleteMany({});
    await redisService.getClient().del('quotes:latest:FPT');

    console.log('\n⚡ Test #1: Creating Market Core Master Data');
    const exchange = await prisma.stockExchange.upsert({
      where: { code: EXCHANGE_CODE.HOSE },
      update: {},
      create: { code: EXCHANGE_CODE.HOSE, name: 'HOSE' }
    });
    
    const sector = await prisma.sector.upsert({
      where: { code: 'TECH' },
      update: {},
      create: { name: 'Technology', code: 'TECH' }
    });

    const industry = await prisma.industry.upsert({
      where: { code: 'SOFT' },
      update: {},
      create: { name: 'Software', code: 'SOFT', sectorId: sector.id }
    });

    const stock = await prisma.stock.create({
      data: {
        symbol: 'FPT',
        companyName: 'FPT Corporation',
        exchangeId: exchange.id,
        industryId: industry.id,
      }
    });
    console.log('  [PASS] Sector, Industry, Exchange, and Stock created successfully.');

    console.log('\n⚡ Test #2: Testing ETL Ingestion (MarketSyncService)');
    const dateStr = new Date().toISOString().split('T')[0];
    const mockPayloads = [
      {
        symbol: 'FPT',
        date: dateStr,
        open: 130000,
        high: 132000,
        low: 129000,
        close: 131500,
        volume: 1500000
      }
    ];

    const syncResult = await marketSyncService.syncDailyQuotes('VNDIRECT_API', mockPayloads);
    if (syncResult.upsertedCount !== 1 || syncResult.failedCount !== 0) {
      throw new Error(`Sync failed. Expected 1 upsert, got ${syncResult.upsertedCount}.`);
    }
    console.log('  [PASS] Raw OHLCV successfully ingested into Postgres & Redis.');

    console.log('\n⚡ Test #2.5: Testing MockMarketAdapter Integration (Fixture-only & Test-only)');
    const mockAdapter = new MockMarketAdapter();
    const adapterResponse = await mockAdapter.fetchDailyQuotes(['FPT']);
    if (!adapterResponse.success) {
      throw new Error(`Mock adapter failed to fetch daily quotes: ${adapterResponse.error}`);
    }
    // Update dates in adapter response data to current date to match existing flow
    adapterResponse.data.forEach((item) => {
      item.date = dateStr;
    });

    const adapterSyncResult = await marketSyncService.syncDailyQuotes(adapterResponse.provider, adapterResponse.data);
    if (adapterSyncResult.upsertedCount !== 1 || adapterSyncResult.failedCount !== 0) {
      throw new Error(`Mock adapter sync failed. Expected 1 upsert, got ${adapterSyncResult.upsertedCount}.`);
    }
    console.log('  [PASS] MockMarketAdapter returned expected shape and synced successfully.');

    console.log('\n⚡ Test #3: Testing Idempotency (Duplicate Ingestion)');
    const duplicateSyncResult = await marketSyncService.syncDailyQuotes('VNDIRECT_API', mockPayloads);
    if (duplicateSyncResult.upsertedCount !== 1 || duplicateSyncResult.failedCount !== 0) {
      throw new Error('Duplicate sync failed to upsert gracefully.');
    }
    
    const countDB = await prisma.stockPriceDaily.count({ where: { stockId: stock.id } });
    if (countDB !== 1) {
      throw new Error(`Expected exactly 1 OHLCV record, found ${countDB}.`);
    }
    console.log('  [PASS] Idempotent upsert protected against duplicate OHLCV records.');

    console.log('\n⚡ Test #4: Verify Market Repository & Redis Cache Read');
    const fptStock = await marketService.getStock('FPT');
    if (!fptStock || !fptStock.realtimeQuote) {
      throw new Error('Failed to retrieve realtime quote from cache via MarketService.');
    }
    if (fptStock.realtimeQuote.close !== 131500) {
      throw new Error(`Expected close price 131500, got ${fptStock.realtimeQuote.close}.`);
    }
    console.log('  [PASS] Market Service successfully aggregated DB and Redis Quote.');

    console.log('\n⚡ Test #5: Verify Historical OHLCV Querying');
    const history = await marketService.getHistoricalOHLCV('FPT', new Date('2020-01-01'), new Date());
    if (history.length !== 1) {
      throw new Error('Failed to retrieve historical OHLCV correctly.');
    }
    console.log('  [PASS] Historical OHLCV successfully retrieved.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA MARKET DATA ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ MARKET DATA THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runMarketValidation();
