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
var MarketIntelligenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const market_data_provider_service_1 = require("./market-data-provider.service");
const client_1 = require("@prisma/client");
let MarketIntelligenceService = MarketIntelligenceService_1 = class MarketIntelligenceService {
    prisma;
    provider;
    logger = new common_1.Logger(MarketIntelligenceService_1.name);
    constructor(prisma, provider) {
        this.prisma = prisma;
        this.provider = provider;
    }
    formatDateStr(date) {
        const d = date ? new Date(date) : new Date();
        return d.toISOString().split('T')[0];
    }
    async getSectorRotation(period, limit, tradeDate) {
        const dateStr = this.formatDateStr(tradeDate);
        const dbSectors = await this.prisma.sectorRotationHistory.findMany({
            where: {
                tradeDate: new Date(dateStr)
            },
            orderBy: {
                relativeStrength: 'desc'
            },
            take: limit
        });
        if (dbSectors.length > 0) {
            return dbSectors;
        }
        const computed = await this.provider.getSectorPerformance(dateStr);
        return computed.slice(0, limit);
    }
    async getSectorRotationHistory(sectorCode, startDate, endDate) {
        return this.prisma.sectorRotationHistory.findMany({
            where: {
                sectorCode,
                tradeDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: {
                tradeDate: 'asc'
            }
        });
    }
    async getMoneyFlow(tradeDateStr, groupBy) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const targetDate = new Date(dateStr);
        const dbFlows = await this.prisma.moneyFlowHistory.findMany({
            where: { tradeDate: targetDate }
        });
        let records = dbFlows.map(f => ({
            ticker: f.ticker,
            sectorCode: f.sectorCode,
            sectorName: f.sectorName,
            marketCapGroup: f.marketCapGroup,
            buyValue: Number(f.buyValue),
            sellValue: Number(f.sellValue),
            netValue: Number(f.netValue),
            totalValue: Number(f.totalValue),
            netValueRatio: Number(f.netValueRatio)
        }));
        if (records.length === 0) {
            records = await this.provider.getMoneyFlow(dateStr);
        }
        return this.aggregateMoneyFlow(records, groupBy);
    }
    aggregateMoneyFlow(records, groupBy) {
        if (groupBy === 'ticker') {
            return records.sort((a, b) => b.netValue - a.netValue);
        }
        const groups = {};
        for (const r of records) {
            const key = groupBy === 'sector' ? r.sectorName : r.marketCapGroup;
            if (!key)
                continue;
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    code: groupBy === 'sector' ? r.sectorCode : key,
                    buyValue: 0,
                    sellValue: 0,
                    netValue: 0,
                    totalValue: 0
                };
            }
            groups[key].buyValue += r.buyValue;
            groups[key].sellValue += r.sellValue;
            groups[key].netValue += r.netValue;
            groups[key].totalValue += r.totalValue;
        }
        return Object.values(groups).map(g => ({
            ...g,
            netValueRatio: g.totalValue > 0 ? Math.round((g.netValue / g.totalValue) * 10000) / 100 : 0
        })).sort((a, b) => b.netValue - a.netValue);
    }
    async getMoneyFlowHistory(startDate, endDate, groupBy) {
        const history = await this.prisma.moneyFlowHistory.findMany({
            where: {
                tradeDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { tradeDate: 'asc' }
        });
        const dateGroups = {};
        for (const item of history) {
            const dStr = item.tradeDate.toISOString().split('T')[0];
            if (!dateGroups[dStr])
                dateGroups[dStr] = [];
            dateGroups[dStr].push({
                ticker: item.ticker,
                sectorCode: item.sectorCode,
                sectorName: item.sectorName,
                marketCapGroup: item.marketCapGroup,
                buyValue: Number(item.buyValue),
                sellValue: Number(item.sellValue),
                netValue: Number(item.netValue),
                totalValue: Number(item.totalValue)
            });
        }
        return Object.entries(dateGroups).map(([date, records]) => ({
            tradeDate: date,
            flows: this.aggregateMoneyFlow(records, groupBy)
        }));
    }
    async getForeignFlow(tradeDateStr, groupBy) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const targetDate = new Date(dateStr);
        const dbFlows = await this.prisma.foreignFlowHistory.findMany({
            where: { tradeDate: targetDate }
        });
        let records = dbFlows.map(f => ({
            ticker: f.ticker,
            sectorCode: f.sectorCode,
            sectorName: f.sectorName,
            foreignBuyValue: Number(f.foreignBuyValue),
            foreignSellValue: Number(f.foreignSellValue),
            foreignNetValue: Number(f.foreignNetValue),
            foreignBuyVolume: Number(f.foreignBuyVolume),
            foreignSellVolume: Number(f.foreignSellVolume),
            foreignNetVolume: Number(f.foreignNetVolume),
        }));
        if (records.length === 0) {
            records = await this.provider.getForeignFlow(dateStr);
        }
        return this.aggregateForeignFlow(records, groupBy);
    }
    aggregateForeignFlow(records, groupBy) {
        if (groupBy === 'ticker') {
            return records.sort((a, b) => b.foreignNetValue - a.foreignNetValue);
        }
        const groups = {};
        for (const r of records) {
            const key = groupBy === 'sector' ? r.sectorName : 'Tập hợp thị trường';
            if (!key)
                continue;
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    code: groupBy === 'sector' ? r.sectorCode : 'ALL',
                    foreignBuyValue: 0,
                    foreignSellValue: 0,
                    foreignNetValue: 0,
                    foreignBuyVolume: 0,
                    foreignSellVolume: 0,
                    foreignNetVolume: 0
                };
            }
            groups[key].foreignBuyValue += r.foreignBuyValue;
            groups[key].foreignSellValue += r.foreignSellValue;
            groups[key].foreignNetValue += r.foreignNetValue;
            groups[key].foreignBuyVolume += r.foreignBuyVolume;
            groups[key].foreignSellVolume += r.foreignSellVolume;
            groups[key].foreignNetVolume += r.foreignNetVolume;
        }
        return Object.values(groups).sort((a, b) => b.foreignNetValue - a.foreignNetValue);
    }
    async getForeignFlowHistory(startDate, endDate, groupBy) {
        const history = await this.prisma.foreignFlowHistory.findMany({
            where: {
                tradeDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { tradeDate: 'asc' }
        });
        const dateGroups = {};
        for (const item of history) {
            const dStr = item.tradeDate.toISOString().split('T')[0];
            if (!dateGroups[dStr])
                dateGroups[dStr] = [];
            dateGroups[dStr].push({
                ticker: item.ticker,
                sectorCode: item.sectorCode,
                sectorName: item.sectorName,
                foreignBuyValue: Number(item.foreignBuyValue),
                foreignSellValue: Number(item.foreignSellValue),
                foreignNetValue: Number(item.foreignNetValue),
                foreignBuyVolume: Number(item.foreignBuyVolume),
                foreignSellVolume: Number(item.foreignSellVolume),
                foreignNetVolume: Number(item.foreignNetVolume),
            });
        }
        return Object.entries(dateGroups).map(([date, records]) => ({
            tradeDate: date,
            flows: this.aggregateForeignFlow(records, groupBy)
        }));
    }
    async getMarketBreadth(tradeDateStr, exchange) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const targetDate = new Date(dateStr);
        const dbBreadth = await this.prisma.marketBreadthHistory.findFirst({
            where: {
                tradeDate: targetDate,
                exchange
            }
        });
        if (dbBreadth) {
            return {
                advancingCount: dbBreadth.advancingCount,
                decliningCount: dbBreadth.decliningCount,
                unchangedCount: dbBreadth.unchangedCount,
                totalCount: dbBreadth.totalCount,
                advanceDeclineRatio: Number(dbBreadth.advanceDeclineRatio),
                newHighCount: dbBreadth.newHighCount,
                newLowCount: dbBreadth.newLowCount,
                aboveMa20Count: dbBreadth.aboveMa20Count,
                aboveMa50Count: dbBreadth.aboveMa50Count,
                aboveMa200Count: dbBreadth.aboveMa200Count,
                warnings: []
            };
        }
        return this.provider.getMarketBreadth(exchange, dateStr);
    }
    async getMarketBreadthHistory(startDate, endDate, exchange) {
        return this.prisma.marketBreadthHistory.findMany({
            where: {
                exchange,
                tradeDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { tradeDate: 'asc' }
        });
    }
    async getMarketRegime(indexCode, tradeDateStr) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const targetDate = new Date(dateStr);
        const dbRegime = await this.prisma.marketRegimeHistory.findFirst({
            where: {
                indexCode,
                tradeDate: targetDate
            }
        });
        if (dbRegime) {
            return dbRegime;
        }
        const indexHistory = await this.provider.getIndexHistory(indexCode, 250);
        return this.computeRegimeForData(indexCode, indexHistory, targetDate);
    }
    async getMarketRegimeHistory(indexCode, startDate, endDate) {
        return this.prisma.marketRegimeHistory.findMany({
            where: {
                indexCode,
                tradeDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            orderBy: { tradeDate: 'asc' }
        });
    }
    computeRegimeForData(indexCode, history, targetDate) {
        if (history.length === 0) {
            return {
                tradeDate: targetDate,
                indexCode,
                close: 1200,
                ema20: 1200,
                ema50: 1200,
                ema200: 1200,
                atr: 15,
                adx: 25,
                regime: 'Neutral',
                riskScore: 50,
                explanation: 'Không có đủ dữ liệu lịch sử để phân tích thị trường.'
            };
        }
        const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const calculateEMA = (prices, periods) => {
            const k = 2 / (periods + 1);
            const ema = [];
            let sum = 0;
            for (let i = 0; i < periods; i++) {
                sum += prices[i];
            }
            ema[periods - 1] = sum / periods;
            for (let i = periods; i < prices.length; i++) {
                ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
            }
            return ema;
        };
        const calculateATR = (highs, lows, closes, periods = 14) => {
            const atr = [];
            const tr = [];
            tr[0] = highs[0] - lows[0];
            for (let i = 1; i < highs.length; i++) {
                tr[i] = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
            }
            let sum = 0;
            for (let i = 0; i < periods; i++) {
                sum += tr[i];
            }
            atr[periods - 1] = sum / periods;
            for (let i = periods; i < tr.length; i++) {
                atr[i] = (atr[i - 1] * (periods - 1) + tr[i]) / periods;
            }
            return atr;
        };
        const closes = sorted.map(h => h.close);
        const highs = sorted.map(h => h.high);
        const lows = sorted.map(h => h.low);
        const ema20 = calculateEMA(closes, 20);
        const ema50 = calculateEMA(closes, 50);
        const ema200 = calculateEMA(closes, 200);
        const atr = calculateATR(highs, lows, closes, 14);
        const idx = sorted.length - 1;
        const currentClose = closes[idx];
        const curE20 = ema20[idx] || currentClose;
        const curE50 = ema50[idx] || currentClose;
        const curE200 = ema200[idx] || currentClose;
        const curAtr = atr[idx] || 15;
        const mockAdx = 25 + Math.round(Math.sin(idx * 0.1) * 10);
        let regime = 'Neutral';
        let riskScore = 50;
        const isBullishShort = currentClose > curE20;
        const isBullishMedium = curE20 > curE50;
        const isBullishLong = curE50 > curE200;
        if (isBullishShort && isBullishMedium && isBullishLong) {
            regime = 'Risk-On';
            riskScore = 85;
        }
        else if (currentClose < curE50 && curE20 < curE50) {
            regime = 'Risk-Off';
            riskScore = 15;
        }
        let score = 30;
        if (currentClose > curE20)
            score += 15;
        if (currentClose > curE50)
            score += 15;
        if (currentClose > curE200)
            score += 15;
        if (curE20 > curE50)
            score += 15;
        if (curE50 > curE200)
            score += 10;
        riskScore = Math.min(Math.max(score, 5), 95);
        let explanation = `Chỉ số ${indexCode} kết phiên tại ${currentClose}. `;
        if (regime === 'Risk-On') {
            explanation += `Giá nằm trên đường EMA20, EMA50 và EMA200, xác nhận xu hướng tăng mạnh mẽ (Risk-On). Khuyến nghị ưu tiên nắm giữ tỷ trọng cổ phiếu cao.`;
        }
        else if (regime === 'Risk-Off') {
            explanation += `Giá gãy hỗ trợ EMA50 và EMA20 gãy dưới EMA50, kích hoạt trạng thái rủi ro giảm (Risk-Off). Cảnh báo nhà đầu tư hạ tỷ trọng margin về mức an toàn.`;
        }
        else {
            explanation += `Thị trường đang trong trạng thái tích lũy, giằng co giữa các đường trung bình động (Neutral). Nên trading ngắn hạn biên độ hẹp.`;
        }
        return {
            tradeDate: targetDate,
            indexCode,
            close: new client_1.Prisma.Decimal(currentClose),
            ema20: new client_1.Prisma.Decimal(curE20),
            ema50: new client_1.Prisma.Decimal(curE50),
            ema200: new client_1.Prisma.Decimal(curE200),
            atr: new client_1.Prisma.Decimal(curAtr),
            adx: new client_1.Prisma.Decimal(mockAdx),
            regime,
            riskScore,
            explanation
        };
    }
    async getSummary(tradeDateStr) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const [regime, sectors, moneyFlow, foreignFlow, breadth] = await Promise.all([
            this.getMarketRegime('VNINDEX', dateStr),
            this.getSectorRotation('1M', 10, dateStr),
            this.getMoneyFlow(dateStr, 'sector'),
            this.getForeignFlow(dateStr, 'sector'),
            this.getMarketBreadth(dateStr, 'ALL')
        ]);
        return {
            trade_date: dateStr,
            market_regime: {
                index_code: regime.indexCode,
                close: Number(regime.close),
                regime: regime.regime,
                risk_score: regime.riskScore,
                explanation: regime.explanation,
                ema20: Number(regime.ema20),
                ema50: Number(regime.ema50),
                ema200: Number(regime.ema200),
                atr: Number(regime.atr),
                adx: Number(regime.adx)
            },
            sector_rotation: sectors.map(s => ({
                sectorCode: s.sectorCode,
                sectorName: s.sectorName,
                return1d: Number(s.return1d),
                return1w: Number(s.return1w),
                return1m: Number(s.return1m),
                return3m: Number(s.return3m),
                relativeStrength: Number(s.relativeStrength),
                rank1m: s.rank1m,
                rank3m: s.rank3m
            })),
            money_flow: moneyFlow,
            foreign_flow: foreignFlow,
            market_breadth: breadth,
            warnings: []
        };
    }
    async refreshIntelligenceData(tradeDateStr) {
        const dateStr = this.formatDateStr(tradeDateStr);
        const targetDate = new Date(dateStr);
        this.logger.log(`Refreshing market intelligence data for: ${dateStr}`);
        const sectors = await this.provider.getSectorPerformance(dateStr);
        for (const sec of sectors) {
            await this.prisma.sectorRotationHistory.upsert({
                where: {
                    tradeDate_sectorCode: {
                        tradeDate: targetDate,
                        sectorCode: sec.sectorCode
                    }
                },
                update: {
                    sectorName: sec.sectorName,
                    return1d: sec.return1d,
                    return1w: sec.return1w,
                    return1m: sec.return1m,
                    return3m: sec.return3m,
                    return6m: sec.return6m,
                    returnYtd: sec.returnYtd,
                    relativeStrength: sec.relativeStrength,
                    rank1m: sec.rank1m,
                    rank3m: sec.rank3m
                },
                create: {
                    tradeDate: targetDate,
                    sectorCode: sec.sectorCode,
                    sectorName: sec.sectorName,
                    return1d: sec.return1d,
                    return1w: sec.return1w,
                    return1m: sec.return1m,
                    return3m: sec.return3m,
                    return6m: sec.return6m,
                    returnYtd: sec.returnYtd,
                    relativeStrength: sec.relativeStrength,
                    rank1m: sec.rank1m,
                    rank3m: sec.rank3m
                }
            });
        }
        const flows = await this.provider.getMoneyFlow(dateStr);
        for (const f of flows) {
            await this.prisma.moneyFlowHistory.upsert({
                where: {
                    tradeDate_ticker: {
                        tradeDate: targetDate,
                        ticker: f.ticker
                    }
                },
                update: {
                    sectorCode: f.sectorCode,
                    sectorName: f.sectorName,
                    marketCapGroup: f.marketCapGroup,
                    buyValue: f.buyValue,
                    sellValue: f.sellValue,
                    netValue: f.netValue,
                    totalValue: f.totalValue,
                    netValueRatio: f.netValueRatio
                },
                create: {
                    tradeDate: targetDate,
                    ticker: f.ticker,
                    sectorCode: f.sectorCode,
                    sectorName: f.sectorName,
                    marketCapGroup: f.marketCapGroup,
                    buyValue: f.buyValue,
                    sellValue: f.sellValue,
                    netValue: f.netValue,
                    totalValue: f.totalValue,
                    netValueRatio: f.netValueRatio
                }
            });
        }
        const foreignFlows = await this.provider.getForeignFlow(dateStr);
        for (const ff of foreignFlows) {
            await this.prisma.foreignFlowHistory.upsert({
                where: {
                    tradeDate_ticker: {
                        tradeDate: targetDate,
                        ticker: ff.ticker
                    }
                },
                update: {
                    sectorCode: ff.sectorCode,
                    sectorName: ff.sectorName,
                    foreignBuyValue: ff.foreignBuyValue,
                    foreignSellValue: ff.foreignSellValue,
                    foreignNetValue: ff.foreignNetValue,
                    foreignBuyVolume: ff.foreignBuyVolume,
                    foreignSellVolume: ff.foreignSellVolume,
                    foreignNetVolume: ff.foreignNetVolume
                },
                create: {
                    tradeDate: targetDate,
                    ticker: ff.ticker,
                    sectorCode: ff.sectorCode,
                    sectorName: ff.sectorName,
                    foreignBuyValue: ff.foreignBuyValue,
                    foreignSellValue: ff.foreignSellValue,
                    foreignNetValue: ff.foreignNetValue,
                    foreignBuyVolume: ff.foreignBuyVolume,
                    foreignSellVolume: ff.foreignSellVolume,
                    foreignNetVolume: ff.foreignNetVolume
                }
            });
        }
        const exchanges = ['HOSE', 'HNX', 'UPCOM', 'ALL'];
        for (const ex of exchanges) {
            const b = await this.provider.getMarketBreadth(ex, dateStr);
            await this.prisma.marketBreadthHistory.upsert({
                where: {
                    tradeDate_exchange: {
                        tradeDate: targetDate,
                        exchange: ex
                    }
                },
                update: {
                    advancingCount: b.advancingCount,
                    decliningCount: b.decliningCount,
                    unchangedCount: b.unchangedCount,
                    totalCount: b.totalCount,
                    advanceDeclineRatio: b.advanceDeclineRatio,
                    newHighCount: b.newHighCount,
                    newLowCount: b.newLowCount,
                    aboveMa20Count: b.aboveMa20Count,
                    aboveMa50Count: b.aboveMa50Count,
                    aboveMa200Count: b.aboveMa200Count
                },
                create: {
                    tradeDate: targetDate,
                    exchange: ex,
                    advancingCount: b.advancingCount,
                    decliningCount: b.decliningCount,
                    unchangedCount: b.unchangedCount,
                    totalCount: b.totalCount,
                    advanceDeclineRatio: b.advanceDeclineRatio,
                    newHighCount: b.newHighCount,
                    newLowCount: b.newLowCount,
                    aboveMa20Count: b.aboveMa20Count,
                    aboveMa50Count: b.aboveMa50Count,
                    aboveMa200Count: b.aboveMa200Count
                }
            });
        }
        const indices = ['VNINDEX', 'VN30'];
        for (const idx of indices) {
            const r = await this.getMarketRegime(idx, dateStr);
            await this.prisma.marketRegimeHistory.upsert({
                where: {
                    tradeDate_indexCode: {
                        tradeDate: targetDate,
                        indexCode: idx
                    }
                },
                update: {
                    close: r.close,
                    ema20: r.ema20,
                    ema50: r.ema50,
                    ema200: r.ema200,
                    atr: r.atr,
                    adx: r.adx,
                    regime: r.regime,
                    riskScore: r.riskScore,
                    explanation: r.explanation
                },
                create: {
                    tradeDate: targetDate,
                    indexCode: idx,
                    close: r.close,
                    ema20: r.ema20,
                    ema50: r.ema50,
                    ema200: r.ema200,
                    atr: r.atr,
                    adx: r.adx,
                    regime: r.regime,
                    riskScore: r.riskScore,
                    explanation: r.explanation
                }
            });
        }
        return { status: 'success', date: dateStr };
    }
    async exportCSV(tradeDateStr) {
        const summary = await this.getSummary(tradeDateStr);
        let csv = '\uFEFF';
        csv += '--- BÁO CÁO THỊ TRƯỜNG FINTOP DATA ---\r\n';
        csv += `Ngày giao dịch: ${summary.trade_date}\r\n`;
        csv += `Trạng thái xu hướng: ${summary.market_regime.regime}\r\n`;
        csv += `Điểm số rủi ro: ${summary.market_regime.risk_score}/100\r\n`;
        csv += `Đánh giá: ${summary.market_regime.explanation}\r\n\r\n`;
        csv += '--- HIỆU SUẤT CÁC NHÓM NGÀNH ---\r\n';
        csv += 'Mã ngành,Tên ngành,Tăng giảm 1D (%),Tăng giảm 1W (%),Tăng giảm 1M (%),Sức mạnh relative\r\n';
        for (const s of summary.sector_rotation) {
            csv += `${s.sectorCode},${s.sectorName},${s.return1d},${s.return1w},${s.return1m},${s.relativeStrength}\r\n`;
        }
        csv += '\r\n';
        csv += '--- ĐỘ RỘNG THỊ TRƯỜNG ---\r\n';
        csv += `Mã sàn,Số mã Tăng,Số mã Giảm,Không đổi,Tỷ lệ Tăng/Giảm\r\n`;
        const b = summary.market_breadth;
        csv += `ALL,${b.advancingCount},${b.decliningCount},${b.unchangedCount},${b.advanceDeclineRatio}\r\n`;
        return csv;
    }
};
exports.MarketIntelligenceService = MarketIntelligenceService;
exports.MarketIntelligenceService = MarketIntelligenceService = MarketIntelligenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        market_data_provider_service_1.MarketDataProviderService])
], MarketIntelligenceService);
//# sourceMappingURL=market-intelligence.service.js.map