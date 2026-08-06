import { IMarketAdapter, MarketAdapterResponse } from './market-adapter.interface';
export declare class MockMarketAdapter implements IMarketAdapter {
    private shouldFail;
    private useMessySymbols;
    private useZeroValues;
    private useEmptyData;
    setFailureMode(fail: boolean): void;
    setMessySymbolsMode(messy: boolean): void;
    setZeroValuesMode(zero: boolean): void;
    setEmptyDataMode(empty: boolean): void;
    fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse>;
    fetchHistoricalQuotes(symbol: string, startDate: Date, endDate: Date): Promise<MarketAdapterResponse>;
    healthCheck(): Promise<boolean>;
}
