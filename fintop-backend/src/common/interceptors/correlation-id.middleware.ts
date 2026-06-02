import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    // Attach to express request object for downstream logging
    (req as any).correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
