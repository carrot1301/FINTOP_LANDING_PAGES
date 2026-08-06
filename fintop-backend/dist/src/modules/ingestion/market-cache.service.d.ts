import { RedisService } from '../../common/redis/redis.service';
export declare class MarketCacheService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    cacheLatestQuote(symbol: string, quoteData: any): Promise<void>;
    getLatestQuote(symbol: string): Promise<any>;
}
