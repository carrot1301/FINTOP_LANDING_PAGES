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
var MarketCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketCacheService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
let MarketCacheService = MarketCacheService_1 = class MarketCacheService {
    redisService;
    logger = new common_1.Logger(MarketCacheService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    async cacheLatestQuote(symbol, quoteData) {
        const key = `quotes:latest:${symbol}`;
        await this.redisService.getClient().set(key, JSON.stringify(quoteData), 'EX', 86400);
    }
    async getLatestQuote(symbol) {
        const key = `quotes:latest:${symbol}`;
        const data = await this.redisService.getClient().get(key);
        return data ? JSON.parse(data) : null;
    }
};
exports.MarketCacheService = MarketCacheService;
exports.MarketCacheService = MarketCacheService = MarketCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], MarketCacheService);
//# sourceMappingURL=market-cache.service.js.map