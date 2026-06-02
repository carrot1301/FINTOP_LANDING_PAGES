import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@WebSocketGateway({ namespace: '/ws/market', cors: true })
export class MarketGateway {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(MarketGateway.name);

  constructor(private readonly redisService: RedisService) {}

  @SubscribeMessage('subscribe_symbol')
  async handleSubscribeSymbol(@ConnectedSocket() client: Socket, @MessageBody() symbol: string) {
    client.join(`market:quote:${symbol}`);
    this.logger.debug(`Client ${client.id} subscribed to market:quote:${symbol}`);

    // Push latest quote instantly upon subscription
    const cachedQuote = await this.redisService.getClient().get(`quotes:latest:${symbol}`);
    if (cachedQuote) {
      client.emit('quote_update', JSON.parse(cachedQuote));
    }
  }

  @SubscribeMessage('unsubscribe_symbol')
  handleUnsubscribeSymbol(@ConnectedSocket() client: Socket, @MessageBody() symbol: string) {
    client.leave(`market:quote:${symbol}`);
  }

  // Internal method called by Ingestion pipeline to broadcast delta updates
  broadcastQuoteUpdate(symbol: string, payload: any) {
    this.server.to(`market:quote:${symbol}`).emit('quote_update', payload);
  }
}
