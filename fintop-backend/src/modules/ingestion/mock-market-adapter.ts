import { Injectable } from '@nestjs/common';
import { IMarketAdapter, MarketAdapterResponse } from './market-adapter.interface';
import { VALID_OHLCV_FIXTURE, MESSY_SYMBOL_FIXTURE, ZERO_VALUE_FIXTURE } from '../../../../fintop-backend/test/fixtures/market-data-fixtures';

@Injectable()
export class MockMarketAdapter implements IMarketAdapter {
  private shouldFail = false;
  private useMessySymbols = false;
  private useZeroValues = false;
  private useEmptyData = false;

  setFailureMode(fail: boolean) {
    this.shouldFail = fail;
  }

  setMessySymbolsMode(messy: boolean) {
    this.useMessySymbols = messy;
  }

  setZeroValuesMode(zero: boolean) {
    this.useZeroValues = zero;
  }

  setEmptyDataMode(empty: boolean) {
    this.useEmptyData = empty;
  }

  async fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse> {
    const startTime = Date.now();

    if (this.shouldFail) {
      return {
        success: false,
        provider: 'MOCK_PROVIDER',
        data: [],
        latencyMs: Date.now() - startTime,
        error: 'Simulated provider service failure',
      };
    }

    if (this.useEmptyData) {
      return {
        success: true,
        provider: 'MOCK_PROVIDER',
        data: [],
        latencyMs: Date.now() - startTime,
      };
    }

    let sourceData = VALID_OHLCV_FIXTURE;
    if (this.useMessySymbols) {
      sourceData = MESSY_SYMBOL_FIXTURE;
    } else if (this.useZeroValues) {
      sourceData = ZERO_VALUE_FIXTURE;
    }

    const upperSymbols = symbols.map((s) => s.trim().toUpperCase());
    const filteredData = sourceData.filter((item) => {
      const cleanItemSymbol = item.symbol.trim().toUpperCase();
      return upperSymbols.includes(cleanItemSymbol);
    });

    return {
      success: true,
      provider: 'MOCK_PROVIDER',
      data: filteredData,
      latencyMs: Date.now() - startTime,
    };
  }

  async fetchHistoricalQuotes(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MarketAdapterResponse> {
    const startTime = Date.now();

    if (this.shouldFail) {
      return {
        success: false,
        provider: 'MOCK_PROVIDER',
        data: [],
        latencyMs: Date.now() - startTime,
        error: 'Simulated historical fetch failure',
      };
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    let sourceData = VALID_OHLCV_FIXTURE;
    if (this.useMessySymbols) {
      sourceData = MESSY_SYMBOL_FIXTURE;
    }

    const matched = sourceData.filter((item) => item.symbol.trim().toUpperCase() === cleanSymbol);

    const results = matched.map((item) => {
      return {
        ...item,
        date: startDate.toISOString().split('T')[0],
      };
    });

    return {
      success: true,
      provider: 'MOCK_PROVIDER',
      data: this.useEmptyData ? [] : results,
      latencyMs: Date.now() - startTime,
    };
  }

  async healthCheck(): Promise<boolean> {
    return !this.shouldFail;
  }
}
