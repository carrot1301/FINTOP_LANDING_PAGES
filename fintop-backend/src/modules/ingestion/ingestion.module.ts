import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketCacheService } from './market-cache.service';
import { QuoteNormalizerService } from './quote-normalizer.service';
import { MarketSyncService } from './market-sync.service';
import { TcbsMarketAdapter } from './tcbs-market-adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    MarketCacheService,
    QuoteNormalizerService,
    MarketSyncService,
    TcbsMarketAdapter,
  ],
  exports: [
    MarketSyncService,
    TcbsMarketAdapter,
  ],
})
export class IngestionModule {}
