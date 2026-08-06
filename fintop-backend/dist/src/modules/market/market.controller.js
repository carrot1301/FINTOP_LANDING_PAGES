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
exports.MarketController = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("./market.service");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MarketController = class MarketController {
    marketService;
    constructor(marketService) {
        this.marketService = marketService;
    }
    async getSectors(pagination) {
        return this.marketService.getSectors();
    }
    async getStocks() {
        return this.marketService.listActiveStocks();
    }
    async lookupStock(symbol) {
        return this.marketService.lookupStockMetadata(symbol);
    }
    async getStock(symbol) {
        return this.marketService.getStock(symbol.toUpperCase());
    }
    async getHistoricalData(symbol, startDate, endDate) {
        return this.marketService.getHistoricalOHLCV(symbol.toUpperCase(), new Date(startDate), new Date(endDate));
    }
    async createStock(dto) {
        return this.marketService.createStock(dto);
    }
    async updateStock(id, dto) {
        return this.marketService.updateStock(parseInt(id, 10), dto);
    }
    async deleteStock(id) {
        return this.marketService.deleteStock(parseInt(id, 10));
    }
    async bulkUpdateStocks(dto) {
        return this.marketService.bulkUpdateStocks(dto);
    }
};
exports.MarketController = MarketController;
__decorate([
    (0, common_1.Get)('sectors'),
    (0, swagger_1.ApiOperation)({ summary: 'List all market sectors' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sectors returned successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getSectors", null);
__decorate([
    (0, common_1.Get)('stocks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active stocks with basic metadata and quotes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getStocks", null);
__decorate([
    (0, common_1.Get)('stocks/lookup/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Look up stock exchange and industry from third-party API' }),
    (0, swagger_1.ApiParam)({ name: 'symbol', example: 'FPT' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "lookupStock", null);
__decorate([
    (0, common_1.Get)('stocks/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock details including realtime quote' }),
    (0, swagger_1.ApiParam)({ name: 'symbol', example: 'FPT' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('stocks/:symbol/historical'),
    (0, swagger_1.ApiOperation)({ summary: 'Get historical OHLCV data for charting' }),
    (0, swagger_1.ApiParam)({ name: 'symbol', example: 'FPT' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: String, required: true, example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: String, required: true, example: '2026-05-18' }),
    __param(0, (0, common_1.Param)('symbol')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getHistoricalData", null);
__decorate([
    (0, common_1.Post)('stocks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new stock (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "createStock", null);
__decorate([
    (0, common_1.Put)('stocks/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update stock analyst data (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Delete)('stocks/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a stock (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "deleteStock", null);
__decorate([
    (0, common_1.Post)('stocks/bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update stock orders or analysis data (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "bulkUpdateStocks", null);
exports.MarketController = MarketController = __decorate([
    (0, swagger_1.ApiTags)('Market Data'),
    (0, common_1.Controller)('market'),
    __metadata("design:paramtypes", [market_service_1.MarketService])
], MarketController);
//# sourceMappingURL=market.controller.js.map