import { PrismaService } from '../../common/database/prisma.service';
import { MarketCacheService } from './market-cache.service';
import { QuoteNormalizerService, RawOHLCVPayload } from './quote-normalizer.service';
export declare class MarketSyncService {
    private readonly prisma;
    private readonly marketCache;
    private readonly normalizer;
    private readonly logger;
    constructor(prisma: PrismaService, marketCache: MarketCacheService, normalizer: QuoteNormalizerService);
    syncDailyQuotes(source: string, payloads: RawOHLCVPayload[]): Promise<{
        upsertedCount: number;
        failedCount: number;
    }>;
}
