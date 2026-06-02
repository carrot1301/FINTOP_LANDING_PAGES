import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }

    const options: RedisOptions = {
      retryStrategy: (times: number) => {
        this.logger.warn(`Redis connection retry attempt #${times}...`);
        // Exponential backoff up to 3 seconds
        return Math.min(times * 200, 3000);
      },
      reconnectOnError: (err) => {
        this.logger.error(`Redis connection error: ${err.message}`);
        return true;
      },
      maxRetriesPerRequest: 10,
    };

    this.client = new Redis(redisUrl, options);

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully.');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis client error: ${err.message}`, err.stack);
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing Redis client...');
    await this.checkHealth();
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Redis client...');
    await this.client.quit();
    this.logger.log('Redis client disconnected cleanly.');
  }

  getClient(): Redis {
    return this.client;
  }

  // Namespaced Cache Keys helper
  formatKey(namespace: string, key: string): string {
    return `fintop:${namespace}:${key}`;
  }

  // TTL Governance helpers
  async setWithTTL(namespace: string, key: string, value: unknown, ttlSeconds: number): Promise<'OK'> {
    const fullKey = this.formatKey(namespace, key);
    const dataString = typeof value === 'string' ? value : JSON.stringify(value);
    return this.client.set(fullKey, dataString, 'EX', ttlSeconds);
  }

  async get<T>(namespace: string, key: string): Promise<T | null> {
    const fullKey = this.formatKey(namespace, key);
    const data = await this.client.get(fullKey);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async del(namespace: string, key: string): Promise<number> {
    const fullKey = this.formatKey(namespace, key);
    return this.client.del(fullKey);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const ping = await this.client.ping();
      return ping === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return false;
    }
  }
}
