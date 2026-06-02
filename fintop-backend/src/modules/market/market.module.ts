import { Module } from '@nestjs/common';
import { MarketRepository } from './market.repository';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  controllers: [MarketController],
  providers: [MarketRepository, MarketService],
  exports: [MarketRepository, MarketService],
})
export class MarketModule {}
