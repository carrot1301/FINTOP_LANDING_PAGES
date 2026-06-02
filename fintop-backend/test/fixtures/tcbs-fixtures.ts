export const VALID_TCBS_BULK_FIXTURE = [
  {
    ticker: 'FPT',
    open: 130000,
    high: 132000,
    low: 129000,
    close: 131500,
    volume: 1500000,
    tradingDate: '2026-05-22',
  },
  {
    ticker: 'TCB',
    open: 48000,
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
    tradingDate: '2026-05-22',
  },
];

export const HISTORICAL_TCBS_FIXTURE = [
  {
    ticker: 'FPT',
    open: 128000,
    high: 130000,
    low: 127000,
    close: 129000,
    volume: 1200000,
    tradingDate: '2026-05-20T00:00:00.000Z',
  },
  {
    ticker: 'FPT',
    open: 129000,
    high: 131000,
    low: 128500,
    close: 130500,
    volume: 1400000,
    tradingDate: '2026-05-21T00:00:00.000Z',
  },
];

export const CORRUPTED_TCBS_FIXTURE = [
  {
    ticker: 'FPT',
    open: 'invalid_price', // string instead of number
    high: 132000,
    low: 129000,
    close: 131500,
    volume: 1500000,
    tradingDate: '2026-05-22',
  },
  {
    ticker: '', // missing ticker symbol
    open: 48000,
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
    tradingDate: '2026-05-22',
  },
  {
    ticker: 'TCB',
    open: 48000,
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
    // tradingDate missing
  },
];

export const HALF_CORRUPTED_TCBS_FIXTURE = [
  {
    ticker: 'FPT',
    open: 130000,
    high: 132000,
    low: 129000,
    close: 131500,
    volume: 1500000,
    tradingDate: '2026-05-22',
  },
  {
    ticker: 'TCB',
    open: 'corrupt',
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
    tradingDate: '2026-05-22',
  },
];
