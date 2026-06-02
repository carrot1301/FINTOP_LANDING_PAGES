import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMarketAdapter, MarketAdapterResponse } from './market-adapter.interface';
import { RawOHLCVPayload } from './quote-normalizer.service';

@Injectable()
export class TcbsMarketAdapter implements IMarketAdapter {
  private readonly logger = new Logger(TcbsMarketAdapter.name);

  // Stateful Circuit Breaker Configuration
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private consecutiveFailures = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly cooldownPeriodMs = 30000; // 30 seconds

  // Custom dependency injection for fetch if needed for testing (defaults to global fetch)
  public fetchOverride: typeof fetch = fetch;

  constructor(private readonly configService: ConfigService) { }

  /**
   * Safe logs helper to prevent printing sensitive configuration or URL parameters.
   */
  private logError(message: string, error?: any) {
    const errorDetails = error?.message || String(error);
    // Sanitize any potential sensitive details (like API keys or specific internal routes)
    const cleanError = errorDetails.replace(/(key|token|auth|password|pass)=[^&]+/gi, '$1=REDACTED');
    this.logger.error(`${message}: ${cleanError}`);
  }

  /**
   * Helper checking if the circuit breaker is open.
   */
  private checkCircuitBreaker(): boolean {
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

  /**
   * Registers a successful request to reset circuit breaker.
   */
  private recordSuccess() {
    if (this.circuitBreakerState !== 'CLOSED') {
      this.logger.log(`Circuit breaker restored to CLOSED state.`);
    }
    this.consecutiveFailures = 0;
    this.circuitBreakerState = 'CLOSED';
  }

  /**
   * Registers a failed request to increment or trip the circuit breaker.
   */
  private recordFailure() {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.circuitBreakerState = 'OPEN';
      this.logger.error(`Circuit breaker tripped to OPEN state. Cooldown period activated.`);
    }
  }

  /**
   * Performs an HTTP request using native fetch with timeouts and backoff retry logic.
   */
  private async executeFetch(url: string, options: RequestInit = {}): Promise<any> {
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
      } catch (error: any) {
        clearTimeout(timeoutId);
        attempt++;

        const isTimeout = error.name === 'AbortError';
        const errorMsg = isTimeout ? 'Request timed out (8000ms exceeded)' : error.message;

        if (attempt > maxRetries) {
          this.logError(`Execution failed after ${maxRetries} retries`, errorMsg);
          this.recordFailure();
          throw new Error(errorMsg);
        }

        // Exponential backoff + jitter
        const backoffMs = process.env.NODE_ENV === 'test' ? 0 : Math.pow(1.5, attempt) * 1000 + (Math.random() * 400 - 200);
        this.logger.warn(`Attempt ${attempt} failed: ${errorMsg}. Retrying in ${Math.round(backoffMs)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  /**
   * Maps a generic/TCBS dynamic raw payload to the standardized RawOHLCVPayload structure.
   */
  public mapToRawOHLCV(item: any): RawOHLCVPayload | null {
    try {
      const symbol = (item.ticker || item.symbol || item.s || '').toString().trim().toUpperCase();
      let rawDate = item.tradingDate || item.date || item.d || item.time || item.t;

      if (!symbol || !rawDate) {
        return null;
      }

      // Convert date standard to YYYY-MM-DD
      let dateStr = '';
      if (typeof rawDate === 'string') {
        dateStr = rawDate.split('T')[0];
      } else if (typeof rawDate === 'number') {
        dateStr = new Date(rawDate).toISOString().split('T')[0];
      } else if (rawDate instanceof Date) {
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
    } catch {
      return null;
    }
  }

  async fetchDailyQuotes(symbols: string[]): Promise<MarketAdapterResponse> {
    const startTime = Date.now();
    const provider = 'TCBS_PROVIDER';

    const baseUrl = this.configService.get<string>('TCBS_API_BASE_URL');
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
      // In a real TCBS implementation, we pull either bulk prices or loop query parameters.
      // E.g., https://apipubuls.tcbs.com.vn/api/v1/coporation/fintdata/last-ohlcv?symbols=FPT,TCB
      const cleanSymbols = symbols.map((s) => s.trim().toUpperCase()).join(',');
      const url = `${baseUrl}/api/v1/coporation/fintdata/last-ohlcv?symbols=${cleanSymbols}`;

      const rawData = await this.executeFetch(url);

      if (!Array.isArray(rawData)) {
        throw new Error('Invalid payload returned: Expected JSON array');
      }

      const parsed: RawOHLCVPayload[] = [];
      let discardedCount = 0;

      for (const item of rawData) {
        const mapped = this.mapToRawOHLCV(item);
        if (mapped) {
          parsed.push(mapped);
        } else {
          discardedCount++;
        }
      }

      if (discardedCount > 0) {
        this.logger.warn(`Discarded ${discardedCount} invalid/malformed raw rows from TCBS payload.`);
      }

      // If more than 50% of the payload was completely malformed (and array wasn't initially empty), fail batch
      if (rawData.length > 0 && parsed.length < rawData.length / 2) {
        throw new Error('Majority of payload rows are corrupt or malformed');
      }

      return {
        success: true,
        provider,
        data: parsed,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        provider,
        data: [],
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  async fetchHistoricalQuotes(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MarketAdapterResponse> {
    const startTime = Date.now();
    const provider = 'TCBS_PROVIDER';

    const baseUrl = this.configService.get<string>('TCBS_API_BASE_URL');
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

      const parsed: RawOHLCVPayload[] = [];
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
    } catch (error: any) {
      return {
        success: false,
        provider,
        data: [],
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    const baseUrl = this.configService.get<string>('TCBS_API_BASE_URL');
    if (!baseUrl) {
      return false;
    }

    try {
      // Small ping verify query to standard base path
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
    } catch {
      return false;
    }
  }
}
