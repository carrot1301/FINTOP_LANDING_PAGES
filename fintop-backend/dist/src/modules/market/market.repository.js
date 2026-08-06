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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let MarketRepository = class MarketRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findStockBySymbol(symbol) {
        return this.prisma.stock.findUnique({
            where: { symbol },
            include: {
                exchange: true,
                industry: { include: { sector: true } },
            },
        });
    }
    async getStocks(params) {
        const { skip, take, exchangeId, sectorId, status } = params;
        return this.prisma.stock.findMany({
            skip,
            take,
            where: {
                status: status || client_1.STOCK_STATUS.ACTIVE,
                exchangeId,
                industry: sectorId ? { sectorId } : undefined,
                deletedAt: null,
            },
            include: {
                exchange: true,
                industry: { include: { sector: true } },
            },
            orderBy: { order: 'asc' },
        });
    }
    async getSectors() {
        return this.prisma.sector.findMany({
            include: { industries: true },
            orderBy: { name: 'asc' },
        });
    }
    async getHistoricalOHLCV(stockId, startDate, endDate) {
        return this.prisma.stockPriceDaily.findMany({
            where: {
                stockId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });
    }
};
exports.MarketRepository = MarketRepository;
exports.MarketRepository = MarketRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketRepository);
//# sourceMappingURL=market.repository.js.map