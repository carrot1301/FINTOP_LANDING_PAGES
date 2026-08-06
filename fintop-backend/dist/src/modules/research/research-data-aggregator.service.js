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
var ResearchDataAggregatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchDataAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const market_service_1 = require("../market/market.service");
const market_intelligence_service_1 = require("../market/market-intelligence.service");
const portfolio_service_1 = require("../portfolio/portfolio.service");
let ResearchDataAggregatorService = ResearchDataAggregatorService_1 = class ResearchDataAggregatorService {
    prisma;
    marketService;
    intelligenceService;
    portfolioService;
    logger = new common_1.Logger(ResearchDataAggregatorService_1.name);
    constructor(prisma, marketService, intelligenceService, portfolioService) {
        this.prisma = prisma;
        this.marketService = marketService;
        this.intelligenceService = intelligenceService;
        this.portfolioService = portfolioService;
    }
    async aggregate(reportType, subject, dateRange) {
        this.logger.log(`Aggregating data for report: ${reportType} - subject: ${subject}`);
        const warnings = [];
        const dataSources = ['Prisma Database', 'Redis Cache'];
        let financials = { status: 'Not applicable' };
        let quant = { status: 'Not applicable' };
        let backtest = { status: 'Data unavailable' };
        let optimizer = { status: 'Data unavailable' };
        let marketIntelligence = { status: 'Not applicable' };
        warnings.push('Backtest Engine data is unavailable in this workspace.');
        warnings.push('Optimizer Engine data is unavailable in this workspace.');
        if (reportType === 'company') {
            dataSources.push('VNDIRECT Stock metadata API');
            try {
                const stock = await this.prisma.stock.findUnique({
                    where: { symbol: subject.toUpperCase().trim() },
                    include: {
                        exchange: true,
                        industry: {
                            include: { sector: true }
                        }
                    }
                });
                if (!stock) {
                    warnings.push(`Stock symbol ${subject} not found in database.`);
                }
                else {
                    const latestPrice = await this.prisma.stockPriceDaily.findFirst({
                        where: { stockId: stock.id },
                        orderBy: { date: 'desc' },
                        select: { close: true, open: true, high: true, low: true, volume: true, date: true }
                    });
                    const latestFin = await this.prisma.financialIndicator.findFirst({
                        where: { stockId: stock.id },
                        orderBy: { date: 'desc' }
                    });
                    financials = {
                        ticker: stock.symbol,
                        companyName: stock.companyName,
                        exchange: stock.exchange.code,
                        sector: stock.industry?.sector?.name || 'Đa ngành',
                        industry: stock.industry?.name || 'Đa ngành',
                        priceClose: latestPrice ? Number(latestPrice.close) : null,
                        priceDate: latestPrice ? latestPrice.date.toISOString().split('T')[0] : null,
                        peRatio: latestFin ? Number(latestFin.peRatio) : null,
                        pbRatio: latestFin ? Number(latestFin.pbRatio) : null,
                        eps: latestFin ? Number(latestFin.eps) : null,
                        marketCap: latestFin ? Number(latestFin.marketCap) : null,
                    };
                    quant = {
                        ratingTA: stock.rsi_mfi || 'ĐI NGANG',
                        trend: stock.identify_trend || 'Chưa xác định',
                        actSignal: stock.act || 'TRUNG LẬP',
                        resistance: stock.resistance_range || 'Không rõ',
                        support: stock.support_range || 'Không rõ',
                        analyst: stock.analyst || 'FinTop DATA',
                    };
                }
            }
            catch (err) {
                this.logger.error(`Error aggregating company data: ${err.message}`);
                warnings.push(`Failed to aggregate company data: ${err.message}`);
            }
        }
        if (reportType === 'sector') {
            dataSources.push('Sector Rotation Engine');
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const sectors = await this.intelligenceService.getSectorRotation('1M', 10, todayStr);
                const sectorData = sectors.find(s => s.sectorName === subject || s.sectorCode === subject);
                if (!sectorData) {
                    warnings.push(`Sector ${subject} not found in database history.`);
                }
                else {
                    marketIntelligence = {
                        sectorCode: sectorData.sectorCode,
                        sectorName: sectorData.sectorName,
                        return1d: Number(sectorData.return1d),
                        return1w: Number(sectorData.return1w),
                        return1m: Number(sectorData.return1m),
                        return3m: Number(sectorData.return3m),
                        relativeStrength: Number(sectorData.relativeStrength),
                        rank1m: sectorData.rank1m,
                        rank3m: sectorData.rank3m,
                    };
                }
            }
            catch (err) {
                this.logger.error(`Error aggregating sector data: ${err.message}`);
                warnings.push(`Failed to aggregate sector data: ${err.message}`);
            }
        }
        if (reportType === 'weekly_market' || reportType === 'market_brief') {
            dataSources.push('Market Intelligence Center');
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const summary = await this.intelligenceService.getSummary(todayStr);
                marketIntelligence = {
                    tradeDate: summary.trade_date,
                    regime: summary.market_regime,
                    breadth: summary.market_breadth,
                    sectors: summary.sector_rotation,
                    moneyFlow: summary.money_flow,
                    foreignFlow: summary.foreign_flow,
                };
            }
            catch (err) {
                this.logger.error(`Error aggregating market data: ${err.message}`);
                warnings.push(`Failed to aggregate market data: ${err.message}`);
            }
        }
        if (reportType === 'portfolio') {
            dataSources.push('Portfolio Management Module');
            try {
                let portfolioId = parseInt(subject, 10);
                if (isNaN(portfolioId)) {
                    const firstPort = await this.prisma.recommendedPortfolio.findFirst({
                        where: { name: { contains: subject } }
                    });
                    portfolioId = firstPort ? firstPort.id : -1;
                }
                const detail = portfolioId !== -1
                    ? await this.portfolioService.getPortfolioDetail(portfolioId, 1, ['Full đặc quyền V.I.P', 'Cố vấn 1-1 chuyên gia'])
                    : null;
                if (!detail) {
                    warnings.push(`Portfolio ${subject} not found.`);
                }
                else {
                    const cash = Number(detail.cashBalance || 0);
                    const holdings = detail.holdings || [];
                    let stocksValue = 0;
                    holdings.forEach(h => {
                        stocksValue += Number(h.currentPrice) * Number(h.quantity);
                    });
                    const totalNav = cash + stocksValue;
                    quant = {
                        portfolioId: detail.id,
                        name: detail.name,
                        description: detail.description,
                        initialCapital: Number(detail.initialCapital),
                        currentNav: totalNav,
                        cashBalance: cash,
                        stocksValue,
                        holdings: holdings.map(h => ({
                            symbol: h.symbol,
                            quantity: Number(h.quantity),
                            avgEntryPrice: Number(h.avgEntryPrice),
                            currentPrice: Number(h.currentPrice),
                            value: Number(h.currentPrice) * Number(h.quantity),
                            allocation: totalNav > 0 ? ((Number(h.currentPrice) * Number(h.quantity)) / totalNav * 100) : 0
                        }))
                    };
                }
            }
            catch (err) {
                this.logger.error(`Error aggregating portfolio data: ${err.message}`);
                warnings.push(`Failed to aggregate portfolio data: ${err.message}`);
            }
        }
        return {
            report_type: reportType,
            subject,
            data_sources: dataSources,
            financials,
            quant,
            backtest,
            optimizer,
            market_intelligence: marketIntelligence,
            warnings
        };
    }
};
exports.ResearchDataAggregatorService = ResearchDataAggregatorService;
exports.ResearchDataAggregatorService = ResearchDataAggregatorService = ResearchDataAggregatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        market_service_1.MarketService,
        market_intelligence_service_1.MarketIntelligenceService,
        portfolio_service_1.PortfolioService])
], ResearchDataAggregatorService);
//# sourceMappingURL=research-data-aggregator.service.js.map