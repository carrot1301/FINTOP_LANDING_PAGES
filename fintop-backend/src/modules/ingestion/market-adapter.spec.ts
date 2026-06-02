import { MockMarketAdapter } from './mock-market-adapter';
import { QuoteNormalizerService } from './quote-normalizer.service';

describe('Market Adapter Contract & Fixture Tests', () => {
  let adapter: MockMarketAdapter;
  let normalizer: QuoteNormalizerService;

  beforeEach(() => {
    adapter = new MockMarketAdapter();
    normalizer = new QuoteNormalizerService();
  });

  describe('1. Response Shape validation', () => {
    it('should return a successful response with proper attributes', async () => {
      const response = await adapter.fetchDailyQuotes(['FPT', 'TCB']);

      expect(response.success).toBe(true);
      expect(response.provider).toBe('MOCK_PROVIDER');
      expect(response.latencyMs).toBeLessThanOrEqual(100);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(2);

      const item = response.data[0];
      expect(item).toHaveProperty('symbol');
      expect(item).toHaveProperty('date');
      expect(item).toHaveProperty('open');
      expect(item).toHaveProperty('high');
      expect(item).toHaveProperty('low');
      expect(item).toHaveProperty('close');
      expect(item).toHaveProperty('volume');
    });
  });

  describe('2. Symbol Normalization Compatibility', () => {
    it('should match messy/lowercase symbols and allow consistent normalizer mapping', async () => {
      adapter.setMessySymbolsMode(true);
      const response = await adapter.fetchDailyQuotes(['fpt']);

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(1);

      const rawItem = response.data[0];
      expect(rawItem.symbol).toBe('  fpt  ');

      const normalized = normalizer.normalizeOHLCV(rawItem);
      expect(normalized.symbol).toBe('FPT');
      expect(normalized.date).toBeInstanceOf(Date);
      expect(normalized.open.toNumber()).toBe(130000);
      expect(normalized.volume).toBe(1500000n);
    });
  });

  describe('3. Empty & Zero Value Handling', () => {
    it('should handle zero value payloads cleanly', async () => {
      adapter.setZeroValuesMode(true);
      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(1);

      const normalized = normalizer.normalizeOHLCV(response.data[0]);
      expect(normalized.open.toNumber()).toBe(0);
      expect(normalized.volume).toBe(0n);
    });

    it('should return success but empty array for unrecognized symbols', async () => {
      const response = await adapter.fetchDailyQuotes(['INVALID_SYMBOL']);
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(0);
    });

    it('should handle explicit empty data mode safely', async () => {
      adapter.setEmptyDataMode(true);
      const response = await adapter.fetchDailyQuotes(['FPT']);
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(0);
    });
  });

  describe('4. Failure Response validation', () => {
    it('should flag failure and include error message', async () => {
      adapter.setFailureMode(true);
      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(false);
      expect(response.data.length).toBe(0);
      expect(response.error).toContain('Simulated provider service failure');
    });

    it('should flag health check as false on failure mode', async () => {
      expect(await adapter.healthCheck()).toBe(true);

      adapter.setFailureMode(true);
      expect(await adapter.healthCheck()).toBe(false);
    });
  });

  describe('5. Historical Fetching Contract Validation', () => {
    it('should return historical quotes mapped to requested dates', async () => {
      const startDate = new Date('2026-05-01');
      const endDate = new Date('2026-05-10');
      const response = await adapter.fetchHistoricalQuotes('FPT', startDate, endDate);

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(1);
      expect(response.data[0].date).toBe('2026-05-01');
    });

    it('should handle failure in historical fetches safely', async () => {
      adapter.setFailureMode(true);
      const response = await adapter.fetchHistoricalQuotes('FPT', new Date(), new Date());

      expect(response.success).toBe(false);
      expect(response.error).toContain('Simulated historical fetch failure');
    });
  });
});
