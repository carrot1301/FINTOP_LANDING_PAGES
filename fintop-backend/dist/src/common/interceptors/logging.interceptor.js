"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const method = request.method;
        const url = request.originalUrl;
        const correlationId = (request.correlationId || request.headers['x-correlation-id'] || 'N/A');
        const startTime = Date.now();
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            this.logger.log(JSON.stringify({
                type: 'request',
                correlationId,
                method,
                url,
                ip: request.ip,
                userAgent: request.headers['user-agent']?.substring(0, 100),
                timestamp: new Date().toISOString(),
            }));
        }
        else {
            this.logger.log(`[${correlationId}] INCOMING ${method} ${url}`);
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                if (isProduction) {
                    this.logger.log(JSON.stringify({
                        type: 'response',
                        correlationId,
                        method,
                        url,
                        statusCode,
                        durationMs: duration,
                        timestamp: new Date().toISOString(),
                    }));
                }
                else {
                    this.logger.log(`[${correlationId}] COMPLETED ${method} ${url} ${statusCode} - ${duration}ms`);
                }
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                if (isProduction) {
                    this.logger.error(JSON.stringify({
                        type: 'error',
                        correlationId,
                        method,
                        url,
                        durationMs: duration,
                        errorMessage: error.message,
                        timestamp: new Date().toISOString(),
                    }));
                }
                else {
                    this.logger.error(`[${correlationId}] FAILED ${method} ${url} - ${duration}ms - ${error.message}`);
                }
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map