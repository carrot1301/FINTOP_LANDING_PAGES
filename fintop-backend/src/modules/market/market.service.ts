import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketRepository } from './market.repository';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class MarketService {
  constructor(
    private readonly repository: MarketRepository,
    private readonly redisService: RedisService,
  ) {}

  async getStock(symbol: string) {
    const cacheKey = `quotes:latest:${symbol}`;
    const cachedData = await this.redisService.getClient().get(cacheKey);
    const cached = cachedData ? JSON.parse(cachedData) : null;
    // Realtime quote would be stored here by ingestion pipeline

    const stock = await this.repository.findStockBySymbol(symbol);
    if (!stock) throw new NotFoundException('Stock not found');
    
    return {
      ...stock,
      realtimeQuote: cached || null,
    };
  }

  async getSectors() {
    return this.repository.getSectors();
  }

  async getHistoricalOHLCV(symbol: string, startDate: Date, endDate: Date) {
    const stock = await this.repository.findStockBySymbol(symbol);
    if (!stock) throw new NotFoundException('Stock not found');

    return this.repository.getHistoricalOHLCV(stock.id, startDate, endDate);
  }
}
