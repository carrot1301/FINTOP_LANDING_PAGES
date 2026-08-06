"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = (request.headers['x-correlation-id'] || request.correlationId || 'N/A');
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
                message = exceptionResponse.message;
            }
            else {
                message = exception.message;
            }
            code = common_1.HttpStatus[status] || 'HTTP_ERROR';
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.CONFLICT;
            code = `PRISMA_${exception.code}`;
            const isStaging = request.headers.host?.includes('staging') || request.hostname?.includes('staging');
            message = this.normalizePrismaError(exception, isStaging);
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            code = 'PRISMA_VALIDATION_ERROR';
            const isStaging = request.headers.host?.includes('staging') || request.hostname?.includes('staging');
            message = (process.env.NODE_ENV !== 'production' || isStaging) ? `[Prisma Validation Error]: ${exception.message}` : 'Database query validation error';
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const isProduction = process.env.NODE_ENV === 'production';
        const isStaging = request.headers.host?.includes('staging') || request.hostname?.includes('staging');
        const errorResponse = {
            statusCode: status,
            code,
            timestamp: new Date().toISOString(),
            path: request.url,
            correlationId,
            message: status === common_1.HttpStatus.INTERNAL_SERVER_ERROR && isProduction && !isStaging ? 'Internal server error' : message,
            ...(isProduction && !isStaging ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
        };
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`[${correlationId}] ${request.method} ${request.url} - Status: ${status}`, exception instanceof Error ? exception.stack : String(exception));
        }
        else {
            this.logger.warn(`[${correlationId}] ${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`);
        }
        response.status(status).json(errorResponse);
    }
    normalizePrismaError(error, isStaging = false) {
        switch (error.code) {
            case 'P2002': {
                const target = error.meta?.target;
                const targetStr = Array.isArray(target) ? target.join(', ') : String(target || '');
                const messageStr = error.message || '';
                if (targetStr.includes('phone') || messageStr.includes('phone')) {
                    return 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.';
                }
                if (targetStr.includes('email') || messageStr.includes('email')) {
                    return 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác.';
                }
                return 'Bản ghi với trường dữ liệu duy nhất này đã tồn tại trên hệ thống.';
            }
            case 'P2025':
                return 'Bản ghi không tồn tại hoặc thao tác không hợp lệ.';
            case 'P2003':
                return 'Lỗi liên kết dữ liệu (Foreign key constraint).';
            default:
                if (process.env.NODE_ENV !== 'production' || isStaging) {
                    return `[Prisma Error ${error.code}]: ${error.message}`;
                }
                return 'Database error occurred during request processing.';
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map