import { ConfigService } from '@nestjs/config';
import { IMarketAdapter, MarketAdapterResponse } from './market-adapter.interface';
import { RawOHLCVPayload } from './quote-normalizer.service';
export declare class TcbsMarketAdapter implements IMarketAdapter {
    private readonly configService;
    private readonly logger;
    private circuitBreakerState;
    private consecutiveFailures;
    private lastFailureTime;
    private readonly failureThreshold;
    private readonly cooldownPeriodMs;
    fetchOverride: typeof fetch;
    constructor(configService: ConfigService);
    private logError;
    private checkCircuitBreaker;
    private recordSuccess;
    private recordFailure;
    private executeFetch;
    mapToRawOHLCV(item: any): RawOHLCVPayload | null;
    fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse>;
    fetchHistoricalQuotes(symbol: string, startDate: Date, endDate: Date): Promise<MarketAdapterResponse>;
    healthCheck(): Promise<boolean>;
}
