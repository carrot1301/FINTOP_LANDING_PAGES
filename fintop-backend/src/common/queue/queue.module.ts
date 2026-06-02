import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueConfigService } from './queue.config.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: QueueConfigService,
    }),
  ],
  providers: [QueueConfigService],
  exports: [BullModule, QueueConfigService],
})
export class QueueModule {}
