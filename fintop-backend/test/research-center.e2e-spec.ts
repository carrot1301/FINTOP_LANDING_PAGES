import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { ApiResponseInterceptor } from '../src/common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { INDICATOR_PERIOD } from '@prisma/client';

describe('ResearchCenter (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdReportIds: number[] = [];
  let testStockId: number = -1;
  const testSymbol = 'VNM';
  const testDate = new Date('2026-06-10');

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

    // Find or create test stock in DB for company reports
    let stock = await prisma.stock.findUnique({
      where: { symbol: testSymbol }
    });

    if (!stock) {
      let exchange = await prisma.stockExchange.findFirst();
      if (!exchange) {
        exchange = await prisma.stockExchange.create({
          data: { code: 'HOSE', name: 'Ho Chi Minh Stock Exchange' }
        });
      }

      let industry = await prisma.industry.findFirst();
      if (!industry) {
        industry = await prisma.industry.create({
          data: { code: 'FOOD_TEST', name: 'Thực phẩm' }
        });
      }

      stock = await prisma.stock.create({
        data: {
          symbol: testSymbol,
          companyName: 'Vinamilk Corporation',
          exchangeId: exchange.id,
          industryId: industry.id,
          rsi_mfi: 'TĂNG NHẸ',
          identify_trend: 'Xu hướng tăng',
          act: 'MUA',
          support_range: '65.0 - 66.0',
          resistance_range: '72.0 - 74.0',
          analyst: 'FinTop Research',
        }
      });
    }

    testStockId = stock.id;

    // Clean up any existing test daily records for this stock and date
    await prisma.stockPriceDaily.deleteMany({
      where: { stockId: testStockId, date: testDate }
    });

    await prisma.financialIndicator.deleteMany({
      where: { stockId: testStockId, period: INDICATOR_PERIOD.DAILY, date: testDate }
    });

    // Create fresh test daily price record
    await prisma.stockPriceDaily.create({
      data: {
        stockId: testStockId,
        date: testDate,
        open: 125.0,
        high: 128.0,
        low: 124.0,
        close: 127.0,
        volume: 2000000
      }
    });

    // Create fresh test financial indicator record
    await prisma.financialIndicator.create({
      data: {
        stockId: testStockId,
        period: INDICATOR_PERIOD.DAILY,
        date: testDate,
        peRatio: 18.5,
        pbRatio: 3.2,
        eps: 6800,
        marketCap: 160000000000000
      }
    });
  });

  afterAll(async () => {
    // Cleanup generated research reports
    if (createdReportIds.length > 0) {
      await prisma.researchReport.deleteMany({
        where: { id: { in: createdReportIds } }
      });
    }

    // Cleanup mock price & indicator data created for this specific date
    if (testStockId !== -1) {
      await prisma.stockPriceDaily.deleteMany({
        where: { stockId: testStockId, date: testDate }
      });
      await prisma.financialIndicator.deleteMany({
        where: { stockId: testStockId, period: INDICATOR_PERIOD.DAILY, date: testDate }
      });
    }

    await app.close();
  });

  describe('GET /research/templates', () => {
    it('should return available report templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/research/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('sections');
    });
  });

  describe('POST /research/generate', () => {
    it('should fail if subject or type is missing', async () => {
      await request(app.getHttpServer())
        .post('/research/generate')
        .send({ report_type: 'company' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/research/generate')
        .send({ subject: testSymbol })
        .expect(400);
    });

    it('should fail for invalid report type', async () => {
      await request(app.getHttpServer())
        .post('/research/generate')
        .send({ report_type: 'invalid_type', subject: testSymbol })
        .expect(400);
    });

    it('should generate a company report and include disclaimer', async () => {
      const response = await request(app.getHttpServer())
        .post('/research/generate')
        .send({
          report_type: 'company',
          subject: testSymbol,
          language: 'vi',
          format: 'markdown'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toContain(testSymbol);
      expect(response.body.data.content).toContain('khuyến nghị đầu tư hoặc tư vấn đầu tư');
      
      createdReportIds.push(response.body.data.id);
    });

    it('should generate a sector report', async () => {
      const response = await request(app.getHttpServer())
        .post('/research/generate')
        .send({
          report_type: 'sector',
          subject: 'Công nghệ thông tin',
          language: 'vi',
          format: 'markdown'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      createdReportIds.push(response.body.data.id);
    });

    it('should generate a weekly market report', async () => {
      const response = await request(app.getHttpServer())
        .post('/research/generate')
        .send({
          report_type: 'weekly_market',
          subject: 'VNINDEX',
          language: 'vi',
          format: 'markdown'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      createdReportIds.push(response.body.data.id);
    });

    it('should generate a portfolio report with warnings if backtest/optimizer data is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/research/generate')
        .send({
          report_type: 'portfolio',
          subject: 'NonexistentPortfolio',
          language: 'vi',
          format: 'markdown'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.content).toContain('không khả dụng');
      
      createdReportIds.push(response.body.data.id);
    });
  });

  describe('GET /research/history', () => {
    it('should return report generation history', async () => {
      const response = await request(app.getHttpServer())
        .get('/research/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('title');
    });
  });

  describe('GET /research/export/:id', () => {
    it('should export report as JSON', async () => {
      const reportId = createdReportIds[0];
      const response = await request(app.getHttpServer())
        .get(`/research/export/${reportId}?format=json`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
    });

    it('should export report as Markdown', async () => {
      const reportId = createdReportIds[0];
      const response = await request(app.getHttpServer())
        .get(`/research/export/${reportId}?format=markdown`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/markdown');
      expect(response.text).toContain('Nghiên cứu & Phân tích Doanh nghiệp');
    });

    it('should export report as DOCX (MS Word compatible HTML)', async () => {
      const reportId = createdReportIds[0];
      const response = await request(app.getHttpServer())
        .get(`/research/export/${reportId}?format=docx`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(response.text).toContain('<html');
      expect(response.text).toContain("xmlns:w='urn:schemas-microsoft-com:office:word'");
    });

    it('should return a warning/bad request for PDF format', async () => {
      const reportId = createdReportIds[0];
      const response = await request(app.getHttpServer())
        .get(`/research/export/${reportId}?format=pdf`)
        .expect(400);

      expect(response.text).toContain('PDF export unavailable');
    });
  });
});
