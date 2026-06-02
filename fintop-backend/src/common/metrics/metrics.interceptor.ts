import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    // Normalize route for label safety (avoid cardinality explosion)
    const route = request.route?.path || request.path || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode.toString();
          this.metricsService.httpRequestDuration.observe(
            { method: request.method, route, status_code: statusCode },
            duration,
          );
          this.metricsService.httpRequestsTotal.inc(
            { method: request.method, route, status_code: statusCode },
          );
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.httpRequestDuration.observe(
            { method: request.method, route, status_code: '500' },
            duration,
          );
          this.metricsService.httpRequestsTotal.inc(
            { method: request.method, route, status_code: '500' },
          );
        },
      }),
    );
  }
}
