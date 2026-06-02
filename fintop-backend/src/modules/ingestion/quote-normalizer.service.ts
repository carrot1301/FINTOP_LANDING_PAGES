import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface RawOHLCVPayload {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedOHLCV {
  symbol: string;
  date: Date;
  open: Prisma.Decimal;
  high: Prisma.Decimal;
  low: Prisma.Decimal;
  close: Prisma.Decimal;
  volume: bigint;
}

@Injectable()
export class QuoteNormalizerService {
  normalizeOHLCV(raw: RawOHLCVPayload): NormalizedOHLCV {
    return {
      symbol: raw.symbol.trim().toUpperCase(),
      date: new Date(raw.date),
      open: new Prisma.Decimal(raw.open || 0),
      high: new Prisma.Decimal(raw.high || 0),
      low: new Prisma.Decimal(raw.low || 0),
      close: new Prisma.Decimal(raw.close || 0),
      volume: BigInt(raw.volume || 0),
    };
  }
}
