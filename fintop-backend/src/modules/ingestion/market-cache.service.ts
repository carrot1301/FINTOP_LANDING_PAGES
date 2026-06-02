import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class MarketCacheService {
  private readonly logger = new Logger(MarketCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async cacheLatestQuote(symbol: string, quoteData: any) {
    const key = `quotes:latest:${symbol}`;
    // Overwrite semantics, expires in 1 day just in case data goes stale
    await this.redisService.getClient().set(key, JSON.stringify(quoteData), 'EX', 86400);
  }

  async getLatestQuote(symbol: string) {
    const key = `quotes:latest:${symbol}`;
    const data = await this.redisService.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }
}
