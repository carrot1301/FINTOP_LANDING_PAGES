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
var MarketSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const market_cache_service_1 = require("./market-cache.service");
const quote_normalizer_service_1 = require("./quote-normalizer.service");
let MarketSyncService = MarketSyncService_1 = class MarketSyncService {
    prisma;
    marketCache;
    normalizer;
    logger = new common_1.Logger(MarketSyncService_1.name);
    constructor(prisma, marketCache, normalizer) {
        this.prisma = prisma;
        this.marketCache = marketCache;
        this.normalizer = normalizer;
    }
    async syncDailyQuotes(source, payloads) {
        this.logger.log(`Starting sync from ${source} for ${payloads.length} quotes`);
        const syncLog = await this.prisma.marketDataSyncLog.create({
            data: { source, syncType: 'DAILY_OHLCV', status: 'PENDING' },
        });
        let upsertedCount = 0;
        let failedCount = 0;
        for (const raw of payloads) {
            try {
                const normalized = this.normalizer.normalizeOHLCV(raw);
                const stock = await this.prisma.stock.findUnique({
                    where: { symbol: normalized.symbol },
                    select: { id: true }
                });
                if (!stock) {
                    throw new Error(`Stock ${normalized.symbol} not found in database`);
                }
                await this.prisma.stockPriceDaily.upsert({
                    where: {
                        stockId_date: {
                            stockId: stock.id,
                            date: normalized.date,
                        }
                    },
                    update: {
                        open: normalized.open,
                        high: normalized.high,
                        low: normalized.low,
                        close: normalized.close,
                        volume: normalized.volume,
                    },
                    create: {
                        stockId: stock.id,
                        date: normalized.date,
                        open: normalized.open,
                        high: normalized.high,
                        low: normalized.low,
                        close: normalized.close,
                        volume: normalized.volume,
                    }
                });
                await this.marketCache.cacheLatestQuote(normalized.symbol, {
                    date: normalized.date,
                    open: normalized.open.toNumber(),
                    high: normalized.high.toNumber(),
                    low: normalized.low.toNumber(),
                    close: normalized.close.toNumber(),
                    volume: Number(normalized.volume),
                });
                upsertedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to sync quote for ${raw.symbol}: ${error.message}`);
                failedCount++;
            }
        }
        await this.prisma.marketDataSyncLog.update({
            where: { id: syncLog.id },
            data: {
                status: failedCount > 0 ? (upsertedCount === 0 ? 'FAILED' : 'SUCCESS') : 'SUCCESS',
                recordsUpserted: upsertedCount,
                recordsFailed: failedCount,
                completedAt: new Date(),
                errorMessage: failedCount > 0 ? `Failed to sync ${failedCount} records` : null,
            }
        });
        return { upsertedCount, failedCount };
    }
};
exports.MarketSyncService = MarketSyncService;
exports.MarketSyncService = MarketSyncService = MarketSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        market_cache_service_1.MarketCacheService,
        quote_normalizer_service_1.QuoteNormalizerService])
], MarketSyncService);
//# sourceMappingURL=market-sync.service.js.map