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
var PortfolioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
let PortfolioService = PortfolioService_1 = class PortfolioService {
    prisma;
    auditService;
    redisService;
    logger = new common_1.Logger(PortfolioService_1.name);
    constructor(prisma, auditService, redisService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.redisService = redisService;
    }
    async createPortfolio(dto) {
        const portfolio = await this.prisma.recommendedPortfolio.create({
            data: {
                name: dto.name,
                description: dto.description,
                managerId: dto.managerId,
                initialCapital: new client_1.Prisma.Decimal(dto.initialCapital),
                currentNav: new client_1.Prisma.Decimal(dto.initialCapital),
                cashBalance: new client_1.Prisma.Decimal(dto.initialCapital),
                status: client_1.PORTFOLIO_STATUS.ACTIVE,
            },
        });
        await this.auditService.log({
            userId: dto.managerId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'PORTFOLIO_CREATED',
            tableName: 'recommended_portfolios',
            recordId: portfolio.id.toString(),
        });
        return portfolio;
    }
    async addHolding(dto) {
        return this.prisma.$transaction(async (tx) => {
            const portfolio = await tx.recommendedPortfolio.findUnique({
                where: { id: dto.portfolioId }
            });
            if (!portfolio)
                throw new common_1.NotFoundException('Portfolio not found');
            const holdingCost = new client_1.Prisma.Decimal(dto.quantity).mul(new client_1.Prisma.Decimal(dto.avgEntryPrice));
            if (portfolio.cashBalance.lessThan(holdingCost)) {
                throw new common_1.BadRequestException('Insufficient cash balance in portfolio');
            }
            const holding = await tx.portfolioHolding.upsert({
                where: { portfolioId_stockId: { portfolioId: dto.portfolioId, stockId: dto.stockId } },
                update: {
                    quantity: { increment: dto.quantity },
                    currentPrice: new client_1.Prisma.Decimal(dto.currentPrice),
                },
                create: {
                    portfolioId: dto.portfolioId,
                    stockId: dto.stockId,
                    quantity: BigInt(dto.quantity),
                    avgEntryPrice: new client_1.Prisma.Decimal(dto.avgEntryPrice),
                    currentPrice: new client_1.Prisma.Decimal(dto.currentPrice),
                }
            });
            await tx.recommendedPortfolio.update({
                where: { id: dto.portfolioId },
                data: {
                    cashBalance: { decrement: holdingCost },
                }
            });
            await this.auditService.log({
                source: client_1.AUDIT_SOURCE.SYSTEM,
                action: 'HOLDING_ADDED',
                tableName: 'portfolio_holdings',
                recordId: holding.id.toString(),
            });
            return holding;
        });
    }
    async calculateNav(portfolioId) {
        return this.prisma.$transaction(async (tx) => {
            const portfolio = await tx.recommendedPortfolio.findUnique({
                where: { id: portfolioId },
                include: { holdings: true },
            });
            if (!portfolio)
                throw new common_1.NotFoundException('Portfolio not found');
            let stocksValue = new client_1.Prisma.Decimal(0);
            for (const h of portfolio.holdings) {
                stocksValue = stocksValue.add(h.currentPrice.mul(new client_1.Prisma.Decimal(h.quantity.toString())));
            }
            const newNav = portfolio.cashBalance.add(stocksValue);
            const updated = await tx.recommendedPortfolio.update({
                where: { id: portfolioId },
                data: { currentNav: newNav },
            });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await tx.portfolioNavSnapshot.upsert({
                where: {
                    portfolioId_date: {
                        portfolioId,
                        date: today
                    }
                },
                update: {
                    nav: newNav,
                    cashBalance: portfolio.cashBalance,
                },
                create: {
                    portfolioId,
                    date: today,
                    nav: newNav,
                    cashBalance: portfolio.cashBalance,
                }
            });
            await this.redisService.getClient().set(`portfolio:nav:${portfolioId}`, newNav.toString(), 'EX', 86400);
            return updated;
        });
    }
    async getPortfolios(userId, userFeatures) {
        const portfolios = await this.prisma.recommendedPortfolio.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        return portfolios.map(p => {
            const locked = !this.isTierAllowed(userFeatures, p.minTierAccess);
            return {
                ...p,
                initialCapital: p.initialCapital.toNumber(),
                currentNav: p.currentNav.toNumber(),
                cashBalance: p.cashBalance.toNumber(),
                locked,
            };
        });
    }
    async getPortfolioDetail(portfolioId, userId, userFeatures) {
        const portfolio = await this.prisma.recommendedPortfolio.findUnique({
            where: { id: portfolioId },
            include: {
                holdings: {
                    include: {
                        stock: true,
                    }
                }
            }
        });
        if (!portfolio || portfolio.deletedAt) {
            throw new common_1.NotFoundException('Portfolio not found');
        }
        const locked = !this.isTierAllowed(userFeatures, portfolio.minTierAccess);
        const initialCapital = portfolio.initialCapital.toNumber();
        const currentNav = portfolio.currentNav.toNumber();
        const cashBalance = portfolio.cashBalance.toNumber();
        const holdings = portfolio.holdings.map(h => {
            const value = h.currentPrice.toNumber() * Number(h.quantity);
            const allocation = currentNav > 0 ? (value / currentNav) * 100 : 0;
            const profitLoss = (h.currentPrice.toNumber() - h.avgEntryPrice.toNumber()) * Number(h.quantity);
            const profitLossPercent = h.avgEntryPrice.toNumber() > 0 ? ((h.currentPrice.toNumber() - h.avgEntryPrice.toNumber()) / h.avgEntryPrice.toNumber()) * 100 : 0;
            return {
                id: h.id,
                stockId: h.stockId,
                symbol: h.stock.symbol,
                companyName: h.stock.companyName,
                quantity: Number(h.quantity),
                avgEntryPrice: h.avgEntryPrice.toNumber(),
                currentPrice: h.currentPrice.toNumber(),
                value,
                allocation,
                profitLoss,
                profitLossPercent,
            };
        });
        const cashAllocation = currentNav > 0 ? (cashBalance / currentNav) * 100 : 0;
        return {
            id: portfolio.id,
            name: portfolio.name,
            description: portfolio.description,
            status: portfolio.status,
            minTierAccess: portfolio.minTierAccess,
            initialCapital,
            currentNav,
            cashBalance,
            cashAllocation,
            locked,
            holdings: locked ? [] : holdings,
        };
    }
    isTierAllowed(userFeatures, minTier) {
        return (0, subscription_helper_1.isFeatureAllowed)(userFeatures, minTier);
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = PortfolioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        redis_service_1.RedisService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map