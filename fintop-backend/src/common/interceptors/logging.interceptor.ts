import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const url = request.originalUrl;
    const correlationId = ((request as any).correlationId || request.headers['x-correlation-id'] || 'N/A') as string;
    const startTime = Date.now();
    const isProduction = process.env.NODE_ENV === 'production';

    // Structured JSON entry for incoming request (PII-safe: no body logging)
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
    } else {
      this.logger.log(`[${correlationId}] INCOMING ${method} ${url}`);
    }

    return next.handle().pipe(
      tap({
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
          } else {
            this.logger.log(`[${correlationId}] COMPLETED ${method} ${url} ${statusCode} - ${duration}ms`);
          }
        },
        error: (error: Error) => {
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
          } else {
            this.logger.error(`[${correlationId}] FAILED ${method} ${url} - ${duration}ms - ${error.message}`);
          }
        },
      }),
    );
  }
}
