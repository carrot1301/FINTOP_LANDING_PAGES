import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../common/config/config.module';
import { PrismaModule } from '../common/database/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { QueueModule } from '../common/queue/queue.module';
import { LoggerModule } from '../common/logger/logger.module';
import { HealthModule } from '../common/health/health.module';
import { AuditModule } from '../common/audit/audit.module';
import { MetricsModule } from '../common/metrics/metrics.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    LoggerModule,
    HealthModule,
    AuditModule,
    MetricsModule,
  ],
  exports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    LoggerModule,
    HealthModule,
    AuditModule,
    MetricsModule,
  ],
})
export class InfraModule {}
