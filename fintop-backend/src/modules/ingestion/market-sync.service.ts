import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { MarketCacheService } from './market-cache.service';
import { QuoteNormalizerService, RawOHLCVPayload } from './quote-normalizer.service';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketCache: MarketCacheService,
    private readonly normalizer: QuoteNormalizerService,
  ) {}

  async syncDailyQuotes(source: string, payloads: RawOHLCVPayload[]) {
    this.logger.log(`Starting sync from ${source} for ${payloads.length} quotes`);
    
    const syncLog = await this.prisma.marketDataSyncLog.create({
      data: { source, syncType: 'DAILY_OHLCV', status: 'PENDING' },
    });

    let upsertedCount = 0;
    let failedCount = 0;

    for (const raw of payloads) {
      try {
        const normalized = this.normalizer.normalizeOHLCV(raw);
        
        // Find stock ID
        const stock = await this.prisma.stock.findUnique({
          where: { symbol: normalized.symbol },
          select: { id: true }
        });

        if (!stock) {
          throw new Error(`Stock ${normalized.symbol} not found in database`);
        }

        // Upsert OHLCV (immutable history pattern logic)
        // If a row for the same date exists, we can update it if it's the current trading day
        await this.prisma.stockPriceDaily.upsert({
          where: {
            stockId_date: {
              stockId: stock.id,
              date: normalized.date,
            }
          },
          update: {
            open: normalized.open,
            high: normalized.high,
            low: normalized.low,
            close: normalized.close,
            volume: normalized.volume,
          },
          create: {
            stockId: stock.id,
            date: normalized.date,
            open: normalized.open,
            high: normalized.high,
            low: normalized.low,
            close: normalized.close,
            volume: normalized.volume,
          }
        });

        // Sync to Realtime Cache
        await this.marketCache.cacheLatestQuote(normalized.symbol, {
          date: normalized.date,
          open: normalized.open.toNumber(),
          high: normalized.high.toNumber(),
          low: normalized.low.toNumber(),
          close: normalized.close.toNumber(),
          volume: Number(normalized.volume), // safe assumption for realtime display
        });

        upsertedCount++;
      } catch (error: any) {
        this.logger.error(`Failed to sync quote for ${raw.symbol}: ${error.message}`);
        failedCount++;
      }
    }

    // Finalize Sync Log
    await this.prisma.marketDataSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: failedCount > 0 ? (upsertedCount === 0 ? 'FAILED' : 'SUCCESS') : 'SUCCESS',
        recordsUpserted: upsertedCount,
        recordsFailed: failedCount,
        completedAt: new Date(),
        errorMessage: failedCount > 0 ? `Failed to sync ${failedCount} records` : null,
      }
    });

    return { upsertedCount, failedCount };
  }
}
