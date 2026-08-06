import { Server, Socket } from 'socket.io';
import { RedisService } from '../../common/redis/redis.service';
export declare class MarketGateway {
    private readonly redisService;
    server: Server;
    private readonly logger;
    constructor(redisService: RedisService);
    handleSubscribeSymbol(client: Socket, symbol: string): Promise<void>;
    handleUnsubscribeSymbol(client: Socket, symbol: string): void;
    broadcastQuoteUpdate(symbol: string, payload: any): void;
}
