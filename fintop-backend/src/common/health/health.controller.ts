import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { SkipThrottle } from '@nestjs/throttler';

interface ServiceHealth {
  status: 'up' | 'down';
  latencyMs?: number;
  provider: string;
}

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check — returns overall system status' })
  async check() {
    const [db, cache] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    const isHealthy = db.status === 'up' && cache.status === 'up';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      services: { database: db, cache },
      smtp: this.mailService.getStatus(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe — confirms all dependencies are operational' })
  async readiness() {
    const [db, cache] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    const ready = db.status === 'up' && cache.status === 'up';

    return {
      ready,
      timestamp: new Date().toISOString(),
      checks: { database: db, cache },
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe — confirms process is alive' })
  async liveness() {
    return {
      alive: true,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const ok = await this.prismaService.checkHealth();
      return { status: ok ? 'up' : 'down', latencyMs: Date.now() - start, provider: 'postgresql' };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start, provider: 'postgresql' };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const ok = await this.redisService.checkHealth();
      return { status: ok ? 'up' : 'down', latencyMs: Date.now() - start, provider: 'redis' };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start, provider: 'redis' };
    }
  }
}
