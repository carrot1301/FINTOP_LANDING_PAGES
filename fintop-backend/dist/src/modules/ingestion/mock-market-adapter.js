"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMarketAdapter = void 0;
const common_1 = require("@nestjs/common");
const market_data_fixtures_1 = require("../../../../fintop-backend/test/fixtures/market-data-fixtures");
let MockMarketAdapter = class MockMarketAdapter {
    shouldFail = false;
    useMessySymbols = false;
    useZeroValues = false;
    useEmptyData = false;
    setFailureMode(fail) {
        this.shouldFail = fail;
    }
    setMessySymbolsMode(messy) {
        this.useMessySymbols = messy;
    }
    setZeroValuesMode(zero) {
        this.useZeroValues = zero;
    }
    setEmptyDataMode(empty) {
        this.useEmptyData = empty;
    }
    async fetchDailyQuotes(symbols) {
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
        let sourceData = market_data_fixtures_1.VALID_OHLCV_FIXTURE;
        if (this.useMessySymbols) {
            sourceData = market_data_fixtures_1.MESSY_SYMBOL_FIXTURE;
        }
        else if (this.useZeroValues) {
            sourceData = market_data_fixtures_1.ZERO_VALUE_FIXTURE;
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
    async fetchHistoricalQuotes(symbol, startDate, endDate) {
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
        let sourceData = market_data_fixtures_1.VALID_OHLCV_FIXTURE;
        if (this.useMessySymbols) {
            sourceData = market_data_fixtures_1.MESSY_SYMBOL_FIXTURE;
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
    async healthCheck() {
        return !this.shouldFail;
    }
};
exports.MockMarketAdapter = MockMarketAdapter;
exports.MockMarketAdapter = MockMarketAdapter = __decorate([
    (0, common_1.Injectable)()
], MockMarketAdapter);
//# sourceMappingURL=mock-market-adapter.js.map