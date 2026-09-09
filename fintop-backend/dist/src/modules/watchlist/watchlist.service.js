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
var WatchlistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const audit_service_1 = require("../../common/audit/audit.service");
const client_1 = require("@prisma/client");
let WatchlistService = WatchlistService_1 = class WatchlistService {
    prisma;
    redisService;
    auditService;
    logger = new common_1.Logger(WatchlistService_1.name);
    constructor(prisma, redisService, auditService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.auditService = auditService;
    }
    async createWatchlist(userId, name) {
        const existing = await this.prisma.watchlist.findUnique({
            where: { userId_name: { userId, name } }
        });
        if (existing)
            throw new common_1.BadRequestException('Watchlist name already exists');
        const watchlist = await this.prisma.watchlist.create({
            data: { userId, name, isDefault: name === 'Default' }
        });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'WATCHLIST_CREATED',
            tableName: 'watchlists',
            recordId: watchlist.id.toString(),
        });
        return watchlist;
    }
    async getUserWatchlists(userId) {
        let watchlists = await this.prisma.watchlist.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        stock: true,
                    }
                }
            }
        });
        if (watchlists.length === 0) {
            await this.createWatchlist(userId, 'Default');
            watchlists = await this.prisma.watchlist.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            stock: true,
                        }
                    }
                }
            });
        }
        return watchlists;
    }
    async addStockToWatchlist(userId, watchlistId, stockId, symbol) {
        const watchlist = await this.prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!watchlist || watchlist.userId !== userId)
            throw new common_1.NotFoundException('Watchlist not found');
        let resolvedStockId = stockId;
        if (!resolvedStockId && symbol) {
            const stock = await this.prisma.stock.findUnique({ where: { symbol } });
            if (!stock)
                throw new common_1.NotFoundException(`Stock symbol ${symbol} not found`);
            resolvedStockId = stock.id;
        }
        if (!resolvedStockId) {
            throw new common_1.BadRequestException('Either stockId or symbol must be provided');
        }
        const item = await this.prisma.watchlistItem.upsert({
            where: { watchlistId_stockId: { watchlistId, stockId: resolvedStockId } },
            update: {},
            create: { watchlistId, stockId: resolvedStockId }
        });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'WATCHLIST_ITEM_ADDED',
            tableName: 'watchlist_items',
            recordId: item.id.toString(),
        });
        await this.redisService.getClient().del(`watchlist:user:${userId}`);
        return item;
    }
    async removeStockFromWatchlist(userId, watchlistId, symbol) {
        const watchlist = await this.prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!watchlist || watchlist.userId !== userId)
            throw new common_1.NotFoundException('Watchlist not found');
        const stock = await this.prisma.stock.findUnique({ where: { symbol } });
        if (!stock)
            throw new common_1.NotFoundException(`Stock symbol ${symbol} not found`);
        try {
            await this.prisma.watchlistItem.delete({
                where: {
                    watchlistId_stockId: {
                        watchlistId,
                        stockId: stock.id,
                    }
                }
            });
        }
        catch (e) {
            throw new common_1.NotFoundException('Watchlist item not found');
        }
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'WATCHLIST_ITEM_REMOVED',
            tableName: 'watchlist_items',
            recordId: `${watchlistId}_${stock.id}`,
        });
        await this.redisService.getClient().del(`watchlist:user:${userId}`);
        return { success: true };
    }
};
exports.WatchlistService = WatchlistService;
exports.WatchlistService = WatchlistService = WatchlistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        audit_service_1.AuditService])
], WatchlistService);
//# sourceMappingURL=watchlist.service.js.map