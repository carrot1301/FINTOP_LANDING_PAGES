import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { NotificationQueue } from './notification.queue';
import { NotificationProcessor } from './notification.processor';
import { NotificationController } from './notification.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationQueue, NotificationProcessor],
  exports: [NotificationService, NotificationQueue],
})
export class NotificationModule {}
