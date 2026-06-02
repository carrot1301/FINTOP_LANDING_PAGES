import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/database/prisma.service';
import { ApiResponseInterceptor } from '../src/common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function runApiValidation() {
  console.log('🔍 Bắt đầu kiểm thử API Application Layer Runtime Validation...');

  let app!: INestApplication;
  let prisma!: PrismaService;

  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const config = new DocumentBuilder().setTitle('API Docs').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.init();

    prisma = app.get(PrismaService);

    // Provide a test user
    const email = 'api-test@fintop.vn';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, fullName: 'API Tester', passwordHash: 'dummy' }
      });
    }

    console.log('\n⚡ Test #1: Standardized API Response wrapper');
    const response1 = await request(app.getHttpServer()).get('/market/sectors');
    if (response1.status !== 200) throw new Error('API request failed');
    if (response1.body.success !== true) throw new Error('Missing wrapper "success" field');
    if (!response1.body.timestamp) throw new Error('Missing wrapper "timestamp" field');
    if (!Array.isArray(response1.body.data)) throw new Error('Data payload malformed');
    console.log('  [PASS] ApiResponseInterceptor successfully wraps standard controllers.');

    console.log('\n⚡ Test #2: Pagination Validation & Query Transformation');
    const response2 = await request(app.getHttpServer()).get('/market/sectors?page=-1'); // Should fail Min(1)
    if (response2.status !== 400) throw new Error(`Expected 400 Bad Request, got ${response2.status}`);
    console.log('  [PASS] Global ValidationPipe blocks invalid pagination values natively.');

    console.log('\n⚡ Test #3: Swagger / OpenAPI Access');
    const response3 = await request(app.getHttpServer()).get('/docs-json');
    if (response3.status !== 200) throw new Error('Swagger JSON not generated');
    if (!response3.body.openapi) throw new Error('Invalid Swagger schema');
    console.log('  [PASS] SwaggerModule schema generated perfectly and accessible via /docs.');

    console.log('\n⚡ Test #4: Secure Endpoints Return 401 Unauthenticated');
    const response4 = await request(app.getHttpServer()).get('/users/subscription');
    if (response4.status !== 401) throw new Error('Route not guarded properly');
    console.log('  [PASS] JwtAuthGuard appropriately blocks unauthenticated access.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA API LAYER ĐỀU THÀNH CÔNG (100% PASS)!');

  } catch (error) {
    console.error('\n❌ KIỂM THỬ API THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
      process.exit(0);
    }
  }
}

runApiValidation();
