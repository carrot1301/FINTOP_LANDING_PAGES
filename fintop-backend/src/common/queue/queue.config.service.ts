import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { SharedBullConfigurationFactory, BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class QueueConfigService implements SharedBullConfigurationFactory, OnModuleDestroy {
  private readonly logger = new Logger(QueueConfigService.name);
  private connection?: Redis;

  constructor(private readonly configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined for Queue configuration');
    }

    // BullMQ strictly requires maxRetriesPerRequest: null for its Redis connection
    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        if (times === 1) {
          this.logger.warn('Queue Redis offline. Retrying in background...');
        }
        return Math.min(times * 1000, 10000);
      },
    });

    this.connection.on('error', () => {
      // Quietly handle connection errors during offline mode
    });

    return {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000, // Initial delay 2s → 4s → 8s → 16s → 32s
        },
        removeOnComplete: {
          count: 100,    // Keep last 100 completed jobs for auditing
          age: 3600,     // Remove completed jobs older than 1 hour
        },
        removeOnFail: {
          count: 1000,   // Preserve last 1000 failed jobs for dead-letter analysis
          age: 86400 * 7, // Keep failed jobs for 7 days
        },
      },
    };
  }

  async onModuleDestroy() {
    if (this.connection) {
      try {
        await this.connection.quit();
      } catch (err) {
        // Ignored
      }
    }
  }
}
