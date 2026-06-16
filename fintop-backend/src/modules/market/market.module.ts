import { Module } from '@nestjs/common';
import { MarketRepository } from './market.repository';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketDataProviderService } from './market-data-provider.service';

@Module({
  controllers: [MarketController, MarketIntelligenceController],
  providers: [
    MarketRepository,
    MarketService,
    MarketIntelligenceService,
    MarketDataProviderService,
  ],
  exports: [
    MarketRepository,
    MarketService,
    MarketIntelligenceService,
    MarketDataProviderService,
  ],
})
export class MarketModule {}
