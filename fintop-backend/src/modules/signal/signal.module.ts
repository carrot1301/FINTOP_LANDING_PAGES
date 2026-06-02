import { Module } from '@nestjs/common';
import { SignalService } from './signal.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { SignalController } from './signal.controller';

@Module({
  imports: [WebsocketModule],
  controllers: [SignalController],
  providers: [SignalService],
  exports: [SignalService],
})
export class SignalModule {}
