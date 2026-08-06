"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TcbsMarketAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcbsMarketAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TcbsMarketAdapter = TcbsMarketAdapter_1 = class TcbsMarketAdapter {
    configService;
    logger = new common_1.Logger(TcbsMarketAdapter_1.name);
    circuitBreakerState = 'CLOSED';
    consecutiveFailures = 0;
    lastFailureTime = 0;
    failureThreshold = 5;
    cooldownPeriodMs = 30000;
    fetchOverride = fetch;
    constructor(configService) {
        this.configService = configService;
    }
    logError(message, error) {
        const errorDetails = error?.message || String(error);
        const cleanError = errorDetails.replace(/(key|token|auth|password|pass)=[^&]+/gi, '$1=REDACTED');
        this.logger.error(`${message}: ${cleanError}`);
    }
    checkCircuitBreaker() {
        if (this.circuitBreakerState === 'OPEN') {
            const elapsed = Date.now() - this.lastFailureTime;
            if (elapsed > this.cooldownPeriodMs) {
                this.logger.warn('Circuit breaker cooldowned. Entering HALF-OPEN state to test endpoint.');
                this.circuitBreakerState = 'HALF_OPEN';
                return true;
            }
            this.logger.warn('Circuit breaker is OPEN. Fast-failing request.');
            return false;
        }
        return true;
    }
    recordSuccess() {
        if (this.circuitBreakerState !== 'CLOSED') {
            this.logger.log(`Circuit breaker restored to CLOSED state.`);
        }
        this.consecutiveFailures = 0;
        this.circuitBreakerState = 'CLOSED';
    }
    recordFailure() {
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
        if (this.consecutiveFailures >= this.failureThreshold) {
            this.circuitBreakerState = 'OPEN';
            this.logger.error(`Circuit breaker tripped to OPEN state. Cooldown period activated.`);
        }
    }
    async executeFetch(url, options = {}) {
        const maxRetries = 3;
        let attempt = 0;
        while (attempt <= maxRetries) {
            const controller = new AbortController();
            const timeoutThreshold = process.env.NODE_ENV === 'test' ? 100 : 8000;
            const timeoutId = setTimeout(() => controller.abort(), timeoutThreshold);
            try {
                const response = await this.fetchOverride(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://tcinvest.tcbs.com.vn/',
                        'Origin': 'https://tcinvest.tcbs.com.vn',
                        ...options.headers,
                    },
                });
                clearTimeout(timeoutId);
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    const delaySec = retryAfter ? parseInt(retryAfter, 10) : 2;
                    this.logger.warn(`Rate limited (429). Retrying after ${delaySec}s...`);
                    const waitTime = process.env.NODE_ENV === 'test' ? 0 : delaySec * 1000;
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                    attempt++;
                    continue;
                }
                if (!response.ok) {
                    throw new Error(`HTTP Error Status ${response.status}`);
                }
                const data = await response.json();
                this.recordSuccess();
                return data;
            }
            catch (error) {
                clearTimeout(timeoutId);
                attempt++;
                const isTimeout = error.name === 'AbortError';
                const errorMsg = isTimeout ? 'Request timed out (8000ms exceeded)' : error.message;
                if (attempt > maxRetries) {
                    this.logError(`Execution failed after ${maxRetries} retries`, errorMsg);
                    this.recordFailure();
                    throw new Error(errorMsg);
                }
                const backoffMs = process.env.NODE_ENV === 'test' ? 0 : Math.pow(1.5, attempt) * 1000 + (Math.random() * 400 - 200);
                this.logger.warn(`Attempt ${attempt} failed: ${errorMsg}. Retrying in ${Math.round(backoffMs)}ms...`);
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
        }
    }
    mapToRawOHLCV(item) {
        try {
            const symbol = (item.ticker || item.symbol || item.s || '').toString().trim().toUpperCase();
            let rawDate = item.tradingDate || item.date || item.d || item.time || item.t;
            if (!symbol || !rawDate) {
                return null;
            }
            let dateStr = '';
            if (typeof rawDate === 'string') {
                dateStr = rawDate.split('T')[0];
            }
            else if (typeof rawDate === 'number') {
                dateStr = new Date(rawDate).toISOString().split('T')[0];
            }
            else if (rawDate instanceof Date) {
                dateStr = rawDate.toISOString().split('T')[0];
            }
            const open = Number(item.open ?? item.o ?? 0);
            const high = Number(item.high ?? item.h ?? 0);
            const low = Number(item.low ?? item.l ?? 0);
            const close = Number(item.close ?? item.c ?? 0);
            const volume = Number(item.volume ?? item.v ?? 0);
            if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
                return null;
            }
            return {
                symbol,
                date: dateStr,
                open,
                high,
                low,
                close,
                volume,
            };
        }
        catch {
            return null;
        }
    }
    async fetchDailyQuotes(symbols) {
        const startTime = Date.now();
        const provider = 'TCBS_PROVIDER';
        const baseUrl = this.configService.get('TCBS_API_BASE_URL');
        if (!baseUrl) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                warning: 'TCBS Provider is disabled (TCBS_API_BASE_URL missing in configurations)',
            };
        }
        if (!this.checkCircuitBreaker()) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                error: 'Circuit breaker is open',
            };
        }
        try {
            const cleanSymbols = symbols.map((s) => s.trim().toUpperCase()).join(',');
            const url = `${baseUrl}/api/v1/coporation/fintdata/last-ohlcv?symbols=${cleanSymbols}`;
            const rawData = await this.executeFetch(url);
            if (!Array.isArray(rawData)) {
                throw new Error('Invalid payload returned: Expected JSON array');
            }
            const parsed = [];
            let discardedCount = 0;
            for (const item of rawData) {
                const mapped = this.mapToRawOHLCV(item);
                if (mapped) {
                    parsed.push(mapped);
                }
                else {
                    discardedCount++;
                }
            }
            if (discardedCount > 0) {
                this.logger.warn(`Discarded ${discardedCount} invalid/malformed raw rows from TCBS payload.`);
            }
            if (rawData.length > 0 && parsed.length < rawData.length / 2) {
                throw new Error('Majority of payload rows are corrupt or malformed');
            }
            return {
                success: true,
                provider,
                data: parsed,
                latencyMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    async fetchHistoricalQuotes(symbol, startDate, endDate) {
        const startTime = Date.now();
        const provider = 'TCBS_PROVIDER';
        const baseUrl = this.configService.get('TCBS_API_BASE_URL');
        if (!baseUrl) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                warning: 'TCBS Provider is disabled (TCBS_API_BASE_URL missing in configurations)',
            };
        }
        if (!this.checkCircuitBreaker()) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                error: 'Circuit breaker is open',
            };
        }
        try {
            const cleanSymbol = symbol.trim().toUpperCase();
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            const url = `${baseUrl}/api/v1/coporation/fintdata/historical-ohlcv?symbol=${cleanSymbol}&start=${startStr}&end=${endStr}`;
            const rawData = await this.executeFetch(url);
            if (!Array.isArray(rawData)) {
                throw new Error('Invalid payload returned: Expected JSON array');
            }
            const parsed = [];
            for (const item of rawData) {
                const mapped = this.mapToRawOHLCV(item);
                if (mapped) {
                    parsed.push(mapped);
                }
            }
            return {
                success: true,
                provider,
                data: parsed,
                latencyMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                provider,
                data: [],
                latencyMs: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    async healthCheck() {
        const baseUrl = this.configService.get('TCBS_API_BASE_URL');
        if (!baseUrl) {
            return false;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await this.fetchOverride(`${baseUrl}/api/v1/coporation/fintdata/last-ohlcv?symbols=FPT`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch {
            return false;
        }
    }
};
exports.TcbsMarketAdapter = TcbsMarketAdapter;
exports.TcbsMarketAdapter = TcbsMarketAdapter = TcbsMarketAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TcbsMarketAdapter);
//# sourceMappingURL=tcbs-market-adapter.js.map