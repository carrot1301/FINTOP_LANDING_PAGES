import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseInterceptor } from '../src/common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { CopilotOrchestratorService } from '../src/modules/copilot/copilot-orchestrator.service';
import { SUBSCRIPTION_TIER } from '@prisma/client';

describe('Copilot (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let orchestrator: CopilotOrchestratorService;
  let token: string;
  let testUser: any;
  const testEmail = 'copilot_test@fintop.vn';

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
    jwtService = app.get(JwtService);
    orchestrator = app.get(CopilotOrchestratorService);

    // Setup Test User in DB
    testUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          fullName: 'Copilot Test User',
          passwordHash: 'dummy_hash',
          tierLevel: SUBSCRIPTION_TIER.DIAMOND,
          status: 'ACTIVE',
        },
      });
    }

    // Generate JWT Token
    token = await jwtService.signAsync({ sub: testUser.id, email: testUser.email });
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      await prisma.auditLog.deleteMany({ where: { userId: testUser.id } });
      await prisma.userSession.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    await app.close();
  });

  describe('Authorization checks', () => {
    it('should reject requests without a JWT token', async () => {
      await request(app.getHttpServer())
        .get('/copilot/tools')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject requests with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/copilot/tools')
        .set('Authorization', 'Bearer invalid_token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /copilot/tools', () => {
    it('should list all 8 registered copilot tools', async () => {
      const response = await request(app.getHttpServer())
        .get('/copilot/tools')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(8);

      const toolNames = response.body.data.map((t: any) => t.name);
      expect(toolNames).toContain('get_stock_info');
      expect(toolNames).toContain('get_market_regime');
      expect(toolNames).toContain('get_sector_rotation');
      expect(toolNames).toContain('get_market_breadth');
      expect(toolNames).toContain('get_money_flow');
      expect(toolNames).toContain('get_foreign_flow');
      expect(toolNames).toContain('get_portfolio_detail');
      expect(toolNames).toContain('get_intelligence_summary');
    });
  });

  describe('POST /copilot/chat', () => {
    it('should return 400 when message is missing or empty', async () => {
      await request(app.getHttpServer())
        .post('/copilot/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      await request(app.getHttpServer())
        .post('/copilot/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: '   ' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when message is too long (exceeds 2000 chars)', async () => {
      const longMessage = 'a'.repeat(2001);
      await request(app.getHttpServer())
        .post('/copilot/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: longMessage })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should handle standard chat reply (no tool calls)', async () => {
      const mockReply = 'Chào bạn! Tôi là FINTop AI Copilot. Tôi có thể giúp gì cho bạn?';
      
      // Spy on private callGemini of orchestrator
      const callGeminiSpy = jest.spyOn(orchestrator as any, 'callGemini').mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: mockReply }],
            },
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post('/copilot/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Xin chào AI' })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply).toBe(mockReply);
      expect(response.body.data.toolsUsed).toEqual([]);
      expect(response.body.data.sessionId).toBeDefined();

      callGeminiSpy.mockRestore();
    });

    it('should orchestrate multi-turn tool-calling loop', async () => {
      // First round: model wants to call get_stock_info tool
      // Second round: model outputs final answer text
      const callGeminiSpy = jest.spyOn(orchestrator as any, 'callGemini')
        .mockResolvedValueOnce({
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'get_stock_info',
                      args: { symbol: 'FPT' },
                    },
                  },
                ],
              },
            },
          ],
        })
        .mockResolvedValueOnce({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Cổ phiếu FPT hiện tại có xu hướng tốt dựa trên dữ liệu FINTop.' },
                ],
              },
            },
          ],
        });

      const response = await request(app.getHttpServer())
        .post('/copilot/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Hãy phân tích cổ phiếu FPT giúp tôi' })
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reply).toContain('FPT');
      expect(response.body.data.toolsUsed.length).toBe(1);
      expect(response.body.data.toolsUsed[0]).toEqual({
        name: 'get_stock_info',
        args: { symbol: 'FPT' },
        success: expect.any(Boolean),
      });

      callGeminiSpy.mockRestore();
    });
  });

  describe('DELETE /copilot/session/:id', () => {
    it('should successfully clear the conversation session', async () => {
      const sessionId = 'test-session-id';
      const response = await request(app.getHttpServer())
        .delete(`/copilot/session/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ success: true, message: 'Session cleared' });
    });
  });
});
