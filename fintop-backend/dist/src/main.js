"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const api_response_interceptor_1 = require("./common/interceptors/api-response.interceptor");
const redis_io_adapter_1 = require("./modules/websocket/redis-io.adapter");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        bodyParser: false,
    });
    app.enableShutdownHooks();
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    app.enableCors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(','),
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization,X-Correlation-Id,x-webhook-signature',
        maxAge: 86400,
    });
    const expressApp = app.getHttpAdapter().getInstance();
    const expressModule = await import('express');
    expressApp.use(expressModule.json({ limit: '50mb' }));
    expressApp.use(expressModule.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalInterceptors(new api_response_interceptor_1.ApiResponseInterceptor());
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('FinTop DATA API')
            .setDescription('The API documentation for FinTop DATA Platform')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document);
        logger.log('📚 Swagger documentation available at /docs');
    }
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`🚀 FinTop Platform running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}
bootstrap();
//# sourceMappingURL=main.js.map