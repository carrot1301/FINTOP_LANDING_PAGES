import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TcbsMarketAdapter } from './tcbs-market-adapter';
import {
  VALID_TCBS_BULK_FIXTURE,
  HISTORICAL_TCBS_FIXTURE,
  CORRUPTED_TCBS_FIXTURE,
  HALF_CORRUPTED_TCBS_FIXTURE,
} from '../../../test/fixtures/tcbs-fixtures';

describe('TcbsMarketAdapter Contract, Resiliency & Mapping Tests', () => {
  let adapter: TcbsMarketAdapter;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TCBS_API_BASE_URL') return 'https://mock.apipubuls.tcbs.com.vn';
      if (key === 'TCBS_API_KEY') return 'mock-secret-key-12345';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TcbsMarketAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<TcbsMarketAdapter>(TcbsMarketAdapter);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  describe('1. Standard Contract Mapping & Success Cases', () => {
    it('should translate valid TCBS bulk payloads to standard RawOHLCVPayload format', async () => {
      // Mock native fetch to return VALID_TCBS_BULK_FIXTURE
      adapter.fetchOverride = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => VALID_TCBS_BULK_FIXTURE,
      });

      const response = await adapter.fetchDailyQuotes(['FPT', 'TCB']);

      expect(response.success).toBe(true);
      expect(response.provider).toBe('TCBS_PROVIDER');
      expect(response.data.length).toBe(2);

      const [fpt, tcb] = response.data;
      expect(fpt.symbol).toBe('FPT');
      expect(fpt.date).toBe('2026-05-22');
      expect(fpt.open).toBe(130000);
      expect(fpt.high).toBe(132000);
      expect(fpt.low).toBe(129000);
      expect(fpt.close).toBe(131500);
      expect(fpt.volume).toBe(1500000);

      expect(tcb.symbol).toBe('TCB');
      expect(tcb.volume).toBe(2500000);
    });

    it('should translate TCBS historical payloads and format dates properly', async () => {
      adapter.fetchOverride = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => HISTORICAL_TCBS_FIXTURE,
      });

      const response = await adapter.fetchHistoricalQuotes('FPT', new Date(), new Date());

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
      expect(response.data[0].symbol).toBe('FPT');
      expect(response.data[0].date).toBe('2026-05-20');
      expect(response.data[1].date).toBe('2026-05-21');
    });
  });

  describe('2. Missing Configurations Boundary', () => {
    it('should return a safe warning response and skip connection when TCBS_API_BASE_URL is missing', async () => {
      mockConfigService.get.mockReturnValueOnce(null); // Return null for base URL

      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(false);
      expect(response.data.length).toBe(0);
      expect(response.warning).toContain('TCBS Provider is disabled');
    });
  });

  describe('3. Dynamic Resiliency - Timeout Handling', () => {
    it('should abort requests and handle timeout signals gracefully', async () => {
      // Intercept fetchOverride and simulate slow response exceeding timeout
      adapter.fetchOverride = jest.fn().mockImplementation((url, init) => {
        return new Promise((_, reject) => {
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              reject({ name: 'AbortError', message: 'DOMException: The user aborted a request.' });
            });
          }
        });
      });

      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Request timed out (8000ms exceeded)');
    });
  });

  describe('4. Dynamic Resiliency - Retries & Exponential Backoff', () => {
    it('should retry up to 3 times on transient HTTP errors and eventually succeed', async () => {
      let fetchAttempts = 0;

      adapter.fetchOverride = jest.fn().mockImplementation(async () => {
        fetchAttempts++;
        if (fetchAttempts < 3) {
          // Fail the first two times
          return {
            ok: false,
            status: 500,
            headers: new Map(),
          };
        }
        // Succeed on the third try
        return {
          ok: true,
          status: 200,
          headers: new Map(),
          json: async () => VALID_TCBS_BULK_FIXTURE,
        };
      });

      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(true);
      expect(fetchAttempts).toBe(3);
      expect(response.data.length).toBe(2);
    });

    it('should respect Retry-After header during 429 Rate Limiting calls', async () => {
      let fetchAttempts = 0;

      const headers = new Map<string, string>();
      headers.set('Retry-After', '3'); // Ask to wait 3 seconds

      adapter.fetchOverride = jest.fn().mockImplementation(async () => {
        fetchAttempts++;
        if (fetchAttempts === 1) {
          return {
            ok: false,
            status: 429,
            headers,
          };
        }
        return {
          ok: true,
          status: 200,
          headers: new Map(),
          json: async () => VALID_TCBS_BULK_FIXTURE,
        };
      });

      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(true);
      expect(fetchAttempts).toBe(2);
    });
  });

  describe('5. In-Memory Circuit Breaker Operations', () => {
    it('should trip to OPEN after 5 consecutive failures and fail instantly without external calls', async () => {
      // Setup persistent failures
      adapter.fetchOverride = jest.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Map(),
      });

      // Execute 5 sequential failed operations (each will run retries)
      // To prevent slow tests, let's bypass timers or execute directly
      for (let i = 0; i < 5; i++) {
        await adapter.fetchDailyQuotes(['FPT']);
      }

      // Check the 6th call triggers circuit fast-fail instantly
      adapter.fetchOverride = jest.fn().mockClear(); // Clear mocks to verify no requests are made
      const response = await adapter.fetchDailyQuotes(['FPT']);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Circuit breaker is open');
      expect(adapter.fetchOverride).not.toHaveBeenCalled();
    });
  });

  describe('6. Data Validation and Payload Scrubbing', () => {
    it('should clean and import valid columns while discarding corrupted rows cleanly', async () => {
      adapter.fetchOverride = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => HALF_CORRUPTED_TCBS_FIXTURE,
      });

      const response = await adapter.fetchDailyQuotes(['FPT', 'TCB']);

      expect(response.success).toBe(true);
      // FPT is valid, TCB has corrupt prices and is discarded
      expect(response.data.length).toBe(1);
      expect(response.data[0].symbol).toBe('FPT');
    });

    it('should reject the entire batch if the majority (>=50%) of payload rows are corrupt', async () => {
      adapter.fetchOverride = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => CORRUPTED_TCBS_FIXTURE,
      });

      const response = await adapter.fetchDailyQuotes(['FPT', 'TCB']);

      expect(response.success).toBe(false);
      expect(response.error).toContain('Majority of payload rows are corrupt');
    });
  });

  describe('7. Audited Security & Sensitive Parameters Policy', () => {
    it('should mask API Keys and sensitive tokens inside error logs', async () => {
      const loggerSpy = jest.spyOn((adapter as any).logger, 'error');

      // Force adapter to fail during fetch with a sensitive query string error
      adapter.fetchOverride = jest.fn().mockRejectedValue(
        new Error('Database error under key=mock-secret-key-12345&token=unmasked_token')
      );

      await adapter.fetchDailyQuotes(['FPT']);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedError = loggerSpy.mock.calls[0][0];

      // Sensitive values must be completely unidentifiable
      expect(loggedError).toContain('key=REDACTED');
      expect(loggedError).toContain('token=REDACTED');
      expect(loggedError).not.toContain('mock-secret-key-12345');
      expect(loggedError).not.toContain('unmasked_token');
    });
  });
});
