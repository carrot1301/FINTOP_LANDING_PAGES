import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { NotificationModule } from '../notification/notification.module';
import { AlertController } from './alert.controller';

@Module({
  imports: [NotificationModule],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
