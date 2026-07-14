import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request.headers['x-correlation-id'] || (request as any).correlationId || 'N/A') as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
        message = (exceptionResponse as { message: unknown }).message as string | object;
      } else {
        message = exception.message;
      }
      code = HttpStatus[status] || 'HTTP_ERROR';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma Known Errors (e.g., P2002 Unique constraint failed)
      status = HttpStatus.CONFLICT;
      code = `PRISMA_${exception.code}`;
      message = this.normalizePrismaError(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'PRISMA_VALIDATION_ERROR';
      message = 'Database query validation error';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Secure Production Error Formatting
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = {
      statusCode: status,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      message: status === HttpStatus.INTERNAL_SERVER_ERROR && isProduction ? 'Internal server error' : message,
      ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
    };

    // Logging error
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${correlationId}] ${request.method} ${request.url} - Status: ${status}`, exception instanceof Error ? exception.stack : String(exception));
    } else {
      this.logger.warn(`[${correlationId}] ${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`);
    }

    response.status(status).json(errorResponse);
  }

  private normalizePrismaError(error: Prisma.PrismaClientKnownRequestError): string {
    if (process.env.NODE_ENV !== 'production') {
      return `[Prisma Error ${error.code}]: ${error.message}`;
    }
    switch (error.code) {
      case 'P2002': {
        const target = error.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(', ') : String(target || '');
        if (targetStr.includes('phone')) {
          return 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.';
        }
        if (targetStr.includes('email')) {
          return 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác.';
        }
        return 'Bản ghi với trường dữ liệu duy nhất này đã tồn tại trên hệ thống.';
      }
      case 'P2025':
        return 'Record not found for operation.';
      case 'P2003':
        return 'Foreign key constraint violation.';
      default:
        return 'Database error occurred during request processing.';
    }
  }
}
