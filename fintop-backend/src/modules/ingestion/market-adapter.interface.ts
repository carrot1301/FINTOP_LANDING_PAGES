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
  /**
   * Fetch live/daily quotes for a list of symbols.
   */
  fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse>;

  /**
   * Fetch historical daily OHLCV quotes for a specific symbol within a date range.
   */
  fetchHistoricalQuotes(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MarketAdapterResponse>;

  /**
   * Performs a health check check on the provider service endpoint.
   */
  healthCheck(): Promise<boolean>;
}
