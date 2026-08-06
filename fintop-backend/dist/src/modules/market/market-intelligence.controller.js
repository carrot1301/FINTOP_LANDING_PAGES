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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketIntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const market_intelligence_service_1 = require("./market-intelligence.service");
const market_data_provider_service_1 = require("./market-data-provider.service");
const swagger_1 = require("@nestjs/swagger");
let MarketIntelligenceController = class MarketIntelligenceController {
    service;
    provider;
    constructor(service, provider) {
        this.service = service;
        this.provider = provider;
    }
    async getSectorRotation(period, limit, tradeDate) {
        const lim = limit ? parseInt(limit, 10) : 10;
        return this.service.getSectorRotation(period || '1M', lim, tradeDate);
    }
    async getSectorRotationHistory(sectorCode, startDate, endDate) {
        return this.service.getSectorRotationHistory(sectorCode, startDate, endDate);
    }
    async getMoneyFlow(tradeDate, groupBy) {
        return this.service.getMoneyFlow(tradeDate || new Date().toISOString(), groupBy || 'sector');
    }
    async getMoneyFlowHistory(startDate, endDate, groupBy) {
        return this.service.getMoneyFlowHistory(startDate, endDate, groupBy || 'sector');
    }
    async getForeignFlow(tradeDate, groupBy) {
        return this.service.getForeignFlow(tradeDate || new Date().toISOString(), groupBy || 'sector');
    }
    async getForeignFlowHistory(startDate, endDate, groupBy) {
        return this.service.getForeignFlowHistory(startDate, endDate, groupBy || 'sector');
    }
    async getMarketBreadth(tradeDate, exchange) {
        return this.service.getMarketBreadth(tradeDate || new Date().toISOString(), exchange || 'ALL');
    }
    async getMarketBreadthHistory(startDate, endDate, exchange) {
        return this.service.getMarketBreadthHistory(startDate, endDate, exchange || 'ALL');
    }
    async getMarketRegime(indexCode, tradeDate) {
        return this.service.getMarketRegime(indexCode || 'VNINDEX', tradeDate);
    }
    async getMarketRegimeHistory(indexCode, startDate, endDate) {
        return this.service.getMarketRegimeHistory(indexCode, startDate, endDate);
    }
    async getSummary(tradeDate) {
        return this.service.getSummary(tradeDate);
    }
    async getHealth() {
        return this.provider.healthCheck();
    }
    async refreshData(tradeDate) {
        return this.service.refreshIntelligenceData(tradeDate);
    }
    async exportData(format, tradeDate, res) {
        const f = (format || 'json').toLowerCase();
        if (f === 'csv') {
            const csv = await this.service.exportCSV(tradeDate);
            res?.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res?.setHeader('Content-Disposition', `attachment; filename=market_intelligence_${tradeDate || 'report'}.csv`);
            res?.status(200).send(csv);
        }
        else {
            const summary = await this.service.getSummary(tradeDate);
            res?.setHeader('Content-Type', 'application/json; charset=utf-8');
            res?.status(200).json(summary);
        }
    }
};
exports.MarketIntelligenceController = MarketIntelligenceController;
__decorate([
    (0, common_1.Get)('sector-rotation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ranked sector performance' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, example: '1M' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('trade_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getSectorRotation", null);
__decorate([
    (0, common_1.Get)('sector-rotation/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get historical sector performance' }),
    (0, swagger_1.ApiQuery)({ name: 'sector_code', required: true, example: 'CNTT' }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: true, example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: true, example: '2026-06-01' }),
    __param(0, (0, common_1.Query)('sector_code')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getSectorRotationHistory", null);
__decorate([
    (0, common_1.Get)('money-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get money flow tracker' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'group_by', required: false, example: 'sector' }),
    __param(0, (0, common_1.Query)('trade_date')),
    __param(1, (0, common_1.Query)('group_by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMoneyFlow", null);
__decorate([
    (0, common_1.Get)('money-flow/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get money flow history' }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'group_by', required: false, example: 'sector' }),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('group_by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMoneyFlowHistory", null);
__decorate([
    (0, common_1.Get)('foreign-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get foreign flow monitor' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'group_by', required: false, example: 'sector' }),
    __param(0, (0, common_1.Query)('trade_date')),
    __param(1, (0, common_1.Query)('group_by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getForeignFlow", null);
__decorate([
    (0, common_1.Get)('foreign-flow/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get foreign flow history' }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'group_by', required: false, example: 'sector' }),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('group_by')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getForeignFlowHistory", null);
__decorate([
    (0, common_1.Get)('breadth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market breadth counts' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'exchange', required: false, example: 'ALL' }),
    __param(0, (0, common_1.Query)('trade_date')),
    __param(1, (0, common_1.Query)('exchange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMarketBreadth", null);
__decorate([
    (0, common_1.Get)('breadth/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market breadth history' }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'exchange', required: false, example: 'ALL' }),
    __param(0, (0, common_1.Query)('start_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('exchange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMarketBreadthHistory", null);
__decorate([
    (0, common_1.Get)('regime'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market regime signal' }),
    (0, swagger_1.ApiQuery)({ name: 'index_code', required: false, example: 'VNINDEX' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    __param(0, (0, common_1.Query)('index_code')),
    __param(1, (0, common_1.Query)('trade_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMarketRegime", null);
__decorate([
    (0, common_1.Get)('regime/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market regime history' }),
    (0, swagger_1.ApiQuery)({ name: 'index_code', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'start_date', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'end_date', required: true }),
    __param(0, (0, common_1.Query)('index_code')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getMarketRegimeHistory", null);
__decorate([
    (0, common_1.Get)('intelligence/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all-in-one market intelligence summary for dashboard' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    __param(0, (0, common_1.Query)('trade_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor availability of market data systems' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('intelligence/refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Manual refresh/upsert of market intelligence metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    __param(0, (0, common_1.Query)('trade_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "refreshData", null);
__decorate([
    (0, common_1.Get)('intelligence/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export market intelligence report to JSON or CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, example: 'json' }),
    (0, swagger_1.ApiQuery)({ name: 'trade_date', required: false }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Query)('trade_date')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketIntelligenceController.prototype, "exportData", null);
exports.MarketIntelligenceController = MarketIntelligenceController = __decorate([
    (0, swagger_1.ApiTags)('Market Intelligence'),
    (0, common_1.Controller)('market'),
    __metadata("design:paramtypes", [market_intelligence_service_1.MarketIntelligenceService,
        market_data_provider_service_1.MarketDataProviderService])
], MarketIntelligenceController);
//# sourceMappingURL=market-intelligence.controller.js.map