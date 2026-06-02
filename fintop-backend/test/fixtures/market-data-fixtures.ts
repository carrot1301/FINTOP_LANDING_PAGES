export const VALID_OHLCV_FIXTURE = [
  {
    symbol: 'FPT',
    date: '2026-05-22',
    open: 130000,
    high: 132000,
    low: 129000,
    close: 131500,
    volume: 1500000,
  },
  {
    symbol: 'TCB',
    date: '2026-05-22',
    open: 48000,
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
  },
];

export const MESSY_SYMBOL_FIXTURE = [
  {
    symbol: '  fpt  ',
    date: '2026-05-22',
    open: 130000,
    high: 132000,
    low: 129000,
    close: 131500,
    volume: 1500000,
  },
  {
    symbol: 'Tcb',
    date: '2026-05-22',
    open: 48000,
    high: 49500,
    low: 47500,
    close: 49000,
    volume: 2500000,
  },
];

export const ZERO_VALUE_FIXTURE = [
  {
    symbol: 'FPT',
    date: '2026-05-22',
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
  },
];

export const EMPTY_RESPONSE_FIXTURE = [];
