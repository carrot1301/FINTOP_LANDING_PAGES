import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
export interface IndexDataPoint {
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}
export declare class MarketDataProviderService {
    private readonly prisma;
    private readonly redisService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, configService: ConfigService);
    getIndexHistory(indexCode: string, limit?: number): Promise<IndexDataPoint[]>;
    getSectorPerformance(tradeDate: string): Promise<any[]>;
    private getMockSectorsData;
    getMoneyFlow(tradeDate: string): Promise<any[]>;
    getForeignFlow(tradeDate: string): Promise<any[]>;
    getMarketBreadth(exchange: string, tradeDate: string): Promise<any>;
    healthCheck(): Promise<Record<string, any>>;
}
