import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { ApiResponseInterceptor } from '../src/common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

describe('MarketIntelligence (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    const testDate = new Date('2026-06-10');
    await prisma.sectorRotationHistory.deleteMany({ where: { tradeDate: testDate } });
    await prisma.moneyFlowHistory.deleteMany({ where: { tradeDate: testDate } });
    await prisma.foreignFlowHistory.deleteMany({ where: { tradeDate: testDate } });
    await prisma.marketBreadthHistory.deleteMany({ where: { tradeDate: testDate } });
    await prisma.marketRegimeHistory.deleteMany({ where: { tradeDate: testDate } });

    await app.close();
  });

  describe('GET /market/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('redis');
    });
  });

  describe('POST /market/intelligence/refresh', () => {
    it('should perform upserts successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/market/intelligence/refresh?trade_date=2026-06-10')
        .expect(201);

      expect(response.body.data).toEqual({
        status: 'success',
        date: '2026-06-10'
      });
    });

    it('should be idempotent on second call', async () => {
      await request(app.getHttpServer())
        .post('/market/intelligence/refresh?trade_date=2026-06-10')
        .expect(201);

      const sectorCount = await prisma.sectorRotationHistory.count({
        where: { tradeDate: new Date('2026-06-10') }
      });
      expect(sectorCount).toBeGreaterThan(0);
    });
  });

  describe('GET /market/sector-rotation', () => {
    it('should return sector rotation ranking', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/sector-rotation?trade_date=2026-06-10')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('sectorCode');
        expect(response.body.data[0]).toHaveProperty('return1m');
      }
    });

    it('should accept period parameters', async () => {
      await request(app.getHttpServer())
        .get('/market/sector-rotation?period=3M&limit=5&trade_date=2026-06-10')
        .expect(200);
    });
  });

  describe('GET /market/money-flow', () => {
    it('should return money flow statistics grouped by sector', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/money-flow?trade_date=2026-06-10&group_by=sector')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return money flow statistics grouped by ticker', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/money-flow?trade_date=2026-06-10&group_by=ticker')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /market/foreign-flow', () => {
    it('should return foreign flow stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/foreign-flow?trade_date=2026-06-10&group_by=sector')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /market/breadth', () => {
    it('should return breadth stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/breadth?trade_date=2026-06-10&exchange=ALL')
        .expect(200);

      expect(response.body.data).toHaveProperty('advancingCount');
      expect(response.body.data).toHaveProperty('decliningCount');
      expect(response.body.data).toHaveProperty('advanceDeclineRatio');
    });
  });

  describe('GET /market/regime', () => {
    it('should return regime signals', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/regime?index_code=VNINDEX&trade_date=2026-06-10')
        .expect(200);

      expect(response.body.data).toHaveProperty('regime');
      expect(response.body.data).toHaveProperty('riskScore');
      expect(response.body.data).toHaveProperty('explanation');
    });
  });

  describe('GET /market/intelligence/summary', () => {
    it('should return unified aggregate summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/intelligence/summary?trade_date=2026-06-10')
        .expect(200);

      expect(response.body.data).toHaveProperty('trade_date');
      expect(response.body.data).toHaveProperty('market_regime');
      expect(response.body.data).toHaveProperty('sector_rotation');
      expect(response.body.data).toHaveProperty('money_flow');
      expect(response.body.data).toHaveProperty('foreign_flow');
      expect(response.body.data).toHaveProperty('market_breadth');
    });
  });

  describe('GET /market/intelligence/export', () => {
    it('should export report as JSON by default', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/intelligence/export?trade_date=2026-06-10')
        .expect(200);

      expect(response.body).toHaveProperty('trade_date');
    });

    it('should export report as CSV file', async () => {
      const response = await request(app.getHttpServer())
        .get('/market/intelligence/export?format=csv&trade_date=2026-06-10')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('BÁO CÁO THỊ TRƯỜNG FINTOP DATA');
    });
  });
});
