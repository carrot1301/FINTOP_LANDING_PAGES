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
export declare class QuoteNormalizerService {
    normalizeOHLCV(raw: RawOHLCVPayload): NormalizedOHLCV;
}
