import { Module } from '@nestjs/common';
import { CopyTradeController } from './copy-trade.controller';
import { CopyTradeService } from './copy-trade.service';

@Module({
  controllers: [CopyTradeController],
  providers: [CopyTradeService],
  exports: [CopyTradeService],
})
export class CopyTradeModule {}
