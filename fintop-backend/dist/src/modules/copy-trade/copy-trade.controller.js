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
exports.CopyTradeController = void 0;
const common_1 = require("@nestjs/common");
const copy_trade_service_1 = require("./copy-trade.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
let CopyTradeController = class CopyTradeController {
    copyTradeService;
    constructor(copyTradeService) {
        this.copyTradeService = copyTradeService;
    }
    async getMasters(activeOnly) {
        const active = activeOnly === 'true';
        return this.copyTradeService.listMasters(active);
    }
    async getMaster(id) {
        return this.copyTradeService.getMaster(parseInt(id, 10));
    }
    async createMaster(dto) {
        return this.copyTradeService.createMaster({
            name: dto.name,
            strategy: dto.strategy,
            aum: Number(dto.aum),
            profit: dto.profit ? Number(dto.profit) : undefined,
            winRate: dto.winRate ? Number(dto.winRate) : undefined,
        });
    }
    async updateMaster(id, dto) {
        return this.copyTradeService.updateMaster(parseInt(id, 10), {
            name: dto.name,
            strategy: dto.strategy,
            aum: dto.aum !== undefined ? Number(dto.aum) : undefined,
            profit: dto.profit !== undefined ? Number(dto.profit) : undefined,
            winRate: dto.winRate !== undefined ? Number(dto.winRate) : undefined,
            status: dto.status,
        });
    }
    async deleteMaster(id) {
        return this.copyTradeService.deleteMaster(parseInt(id, 10));
    }
    async getCopiers() {
        return this.copyTradeService.listCopiers();
    }
    async createCopier(dto) {
        return this.copyTradeService.createCopier({
            name: dto.name,
            masterId: parseInt(dto.masterId, 10),
            capital: Number(dto.capital),
            multiplier: Number(dto.multiplier),
        });
    }
    async updateCopier(id, dto) {
        return this.copyTradeService.updateCopier(parseInt(id, 10), {
            multiplier: dto.multiplier !== undefined ? Number(dto.multiplier) : undefined,
            profit: dto.profit !== undefined ? Number(dto.profit) : undefined,
            status: dto.status,
        });
    }
    async deleteCopier(id) {
        return this.copyTradeService.deleteCopier(parseInt(id, 10));
    }
    async getOrders() {
        return this.copyTradeService.listOrders();
    }
    async createOrder(dto) {
        return this.copyTradeService.createOrder({
            masterId: parseInt(dto.masterId, 10),
            symbol: dto.symbol,
            action: dto.action,
            price: Number(dto.price),
            quantity: Number(dto.quantity),
            accounts: parseInt(dto.accounts, 10),
            status: dto.status,
            successRate: dto.successRate !== undefined ? Number(dto.successRate) : undefined,
        });
    }
    async deleteOrder(id) {
        return this.copyTradeService.deleteOrder(parseInt(id, 10));
    }
};
exports.CopyTradeController = CopyTradeController;
__decorate([
    (0, common_1.Get)('masters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of active or all Master Traders' }),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "getMasters", null);
__decorate([
    (0, common_1.Get)('masters/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details of a specific Master Trader' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "getMaster", null);
__decorate([
    (0, common_1.Post)('masters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Master Trader (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "createMaster", null);
__decorate([
    (0, common_1.Put)('masters/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a Master Trader configuration (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "updateMaster", null);
__decorate([
    (0, common_1.Delete)('masters/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a Master Trader (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "deleteMaster", null);
__decorate([
    (0, common_1.Get)('copiers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List all Copiers (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "getCopiers", null);
__decorate([
    (0, common_1.Post)('copiers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create or link a Copier account (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "createCopier", null);
__decorate([
    (0, common_1.Put)('copiers/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a Copier account status or multiplier (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "updateCopier", null);
__decorate([
    (0, common_1.Delete)('copiers/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete/Unlink a Copier account (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "deleteCopier", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of live copy trading order logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Post a new copy trade order log (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Delete)('orders/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.ROLE_CODE.SUPER_ADMIN, client_1.ROLE_CODE.CEO, client_1.ROLE_CODE.ASSISTANT_CEO, client_1.ROLE_CODE.EDITOR_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a copy order log (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CopyTradeController.prototype, "deleteOrder", null);
exports.CopyTradeController = CopyTradeController = __decorate([
    (0, swagger_1.ApiTags)('Copy Trade'),
    (0, common_1.Controller)('copy-trade'),
    __metadata("design:paramtypes", [copy_trade_service_1.CopyTradeService])
], CopyTradeController);
//# sourceMappingURL=copy-trade.controller.js.map