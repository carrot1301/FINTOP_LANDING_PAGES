import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // If data is already an object containing a 'meta' field, we extract it.
        const meta = data?.meta ? data.meta : undefined;
        const result = data?.data !== undefined ? data.data : data;
        
        return {
          success: true,
          data: result,
          meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
