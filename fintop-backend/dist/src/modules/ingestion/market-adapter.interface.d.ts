import { RawOHLCVPayload } from './quote-normalizer.service';
export interface MarketAdapterResponse {
    success: boolean;
    provider: string;
    data: RawOHLCVPayload[];
    latencyMs: number;
    error?: string;
    warning?: string;
}
export interface IMarketAdapter {
    fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse>;
    fetchHistoricalQuotes(symbol: string, startDate: Date, endDate: Date): Promise<MarketAdapterResponse>;
    healthCheck(): Promise<boolean>;
}
