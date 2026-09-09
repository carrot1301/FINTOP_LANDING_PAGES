"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MarketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let MarketGateway = MarketGateway_1 = class MarketGateway {
    redisService;
    server;
    logger = new common_1.Logger(MarketGateway_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    async handleSubscribeSymbol(client, symbol) {
        client.join(`market:quote:${symbol}`);
        this.logger.debug(`Client ${client.id} subscribed to market:quote:${symbol}`);
        const cachedQuote = await this.redisService.getClient().get(`quotes:latest:${symbol}`);
        if (cachedQuote) {
            client.emit('quote_update', JSON.parse(cachedQuote));
        }
    }
    handleUnsubscribeSymbol(client, symbol) {
        client.leave(`market:quote:${symbol}`);
    }
    broadcastQuoteUpdate(symbol, payload) {
        this.server.to(`market:quote:${symbol}`).emit('quote_update', payload);
    }
};
exports.MarketGateway = MarketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MarketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_symbol'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], MarketGateway.prototype, "handleSubscribeSymbol", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe_symbol'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "handleUnsubscribeSymbol", null);
exports.MarketGateway = MarketGateway = MarketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/ws/market', cors: true }),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], MarketGateway);
//# sourceMappingURL=market.gateway.js.map