import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';

async function runInfraValidation() {
  console.log('🔍 Bắt đầu kiểm thử Runtime Infrastructure Validation...');

  let app!: INestApplication;

  try {
    console.log('⚡ Booting NestJS Application Module...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new LoggingInterceptor());

    await app.init();
    console.log('  [PASS] Application booted successfully with all Core Infra modules.');

    // 1. Healthcheck Endpoint Validation (Prisma & Redis connectivity)
    console.log('\n⚡ Test #1: Verify /health endpoint (Prisma & Redis status)');
    const healthResponse = await request(app.getHttpServer())
      .get('/health')
      .set('x-correlation-id', 'test-corr-id-01')
      .expect(HttpStatus.OK);

    console.log('  -> Health Check Output:', JSON.stringify(healthResponse.body, null, 2));
    if (healthResponse.body.status !== 'ok') {
      throw new Error('Health check returned non-ok status');
    }
    if (healthResponse.headers['x-correlation-id'] !== 'test-corr-id-01') {
      throw new Error('Correlation ID was not propagated in headers');
    }
    console.log('  [PASS] /health endpoint, Prisma DB, and Redis are fully operational.');
    console.log('  [PASS] Correlation ID propagation is active.');

    // 2. Exception Filter Validation (Verify 404 Normalization)
    console.log('\n⚡ Test #2: Verify Global Exception Filter & Secure Error Formatting');
    const notFoundResponse = await request(app.getHttpServer())
      .get('/non-existent-route-for-testing')
      .set('x-correlation-id', 'test-corr-id-02')
      .expect(HttpStatus.NOT_FOUND);

    console.log('  -> Not Found Error Output:', JSON.stringify(notFoundResponse.body, null, 2));
    if (notFoundResponse.body.statusCode !== 404 || notFoundResponse.body.correlationId !== 'test-corr-id-02') {
      throw new Error('Global Exception filter output format mismatch');
    }
    console.log('  [PASS] Global Exception Filter successfully normalizes HTTP errors and embeds Correlation ID.');

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM TRA INFRA RUNTIME ĐỀU THÀNH CÔNG (100% PASS)!');
  } catch (error) {
    console.error('\n❌ KIỂM THỬ INFRA RUNTIME THẤT BẠI:', error);
    process.exit(1);
  } finally {
    if (app) {
      console.log('\n⚡ Test #3: Triggering Graceful Shutdown Hooks...');
      await app.close();
      console.log('  [PASS] Application shut down gracefully.');
      process.exit(0);
    }
  }
}

runInfraValidation();
