import { Module, forwardRef } from '@nestjs/common';
import { MarketGateway } from './market.gateway';
import { SignalGateway } from './signal.gateway';
import { NotificationGateway } from './notification.gateway';
import { SocketAuthGuard } from './socket-auth.guard';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => NotificationModule), AuthModule],
  providers: [
    MarketGateway,
    SignalGateway,
    NotificationGateway,
    SocketAuthGuard,
  ],
  exports: [MarketGateway, SignalGateway, NotificationGateway],
})
export class WebsocketModule {}
