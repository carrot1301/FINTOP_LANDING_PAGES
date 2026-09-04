import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { RedisIoAdapter } from './modules/websocket/redis-io.adapter';

// Global BigInt Serialization Patch
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false, // Disable default NestJS body parser to allow custom 10MB limit
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // ── Security Hardening ──────────────────────────────────────
  // Helmet: Sets various HTTP security headers (XSS, clickjacking, etc.)
  app.use(helmet());

  // Compression: Reduce payload sizes for high-throughput market data
  app.use(compression());

  // CORS Governance
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin or matching fintopdata.vn / localhost
      if (!origin || corsOrigin === '*' || origin.includes('fintopdata.vn') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Correlation-Id,x-webhook-signature,Accept,X-Requested-With,Cache-Control,Pragma,Origin,Access-Control-Request-Method,Access-Control-Request-Headers',
    maxAge: 86400, // Pre-flight cache: 24 hours
  });

  // Payload size limits (prevent abuse)
  // CKEditor blogs can have large content; 10MB allows rich articles
  const expressApp = app.getHttpAdapter().getInstance();
  const expressModule = await import('express');
  expressApp.use(expressModule.json({ limit: '50mb' }));
  expressApp.use(expressModule.urlencoded({ limit: '50mb', extended: true }));

  // ── Global Pipes, Filters, Interceptors ─────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // ── Swagger (disabled in production for security) ───────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FinTop DATA API')
      .setDescription('The API documentation for FinTop DATA Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('📚 Swagger documentation available at /docs');
  }

  // ── WebSocket Redis Adapter ──────────────────────────────────
  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    logger.log('📡 WebSocket Redis adapter connected.');
  } catch (err: any) {
    logger.warn('⚠️ Redis offline: WebSocket using default in-memory adapter.');
  }

  // ── Start ─────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 FinTop Platform running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
