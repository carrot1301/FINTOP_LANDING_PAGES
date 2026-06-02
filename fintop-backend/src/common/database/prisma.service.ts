import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

const SLOW_QUERY_THRESHOLD_MS = 1000; // Log queries taking >1s

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    const poolMax = configService.get<number>('DB_POOL_MAX') || 10;
    const timeoutMs = configService.get<number>('DB_TIMEOUT_MS') || 15000;

    // Configure pg pool with production governance
    const pool = new Pool({
      connectionString,
      max: poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: timeoutMs,
      statement_timeout: timeoutMs,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    this.pool = pool;

    // Attach logging listeners with slow-query detection
    // @ts-expect-error - Prisma dynamic event typing
    this.$on('query', (e: any) => {
      if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
        this.logger.warn(`🐌 SLOW QUERY (${e.duration}ms): ${e.query}`);
      } else {
        this.logger.debug(`Query: ${e.query} -- Duration: ${e.duration}ms`);
      }
    });

    // @ts-expect-error - Prisma dynamic event typing
    this.$on('error', (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`, e.target);
    });

    // @ts-expect-error - Prisma dynamic event typing
    this.$on('warn', (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });

    // Pool exhaustion monitoring
    pool.on('error', (err) => {
      this.logger.error(`⚠️ Pool error (possible exhaustion): ${err.message}`);
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing Prisma database connection...');
    await this.$connect();
    this.logger.log('Prisma database connected successfully.');
  }

  async onModuleDestroy() {
    this.logger.log('Closing Prisma database connection...');
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Prisma database connection closed cleanly.');
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /** Execute a callback within a transaction with timeout governance */
  async executeTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
    timeoutMs = 10000,
  ): Promise<T> {
    return this.$transaction(fn, {
      maxWait: 5000,
      timeout: timeoutMs,
    });
  }
}
