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
exports.SignalController = void 0;
const common_1 = require("@nestjs/common");
const signal_service_1 = require("./signal.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const subscription_tier_guard_1 = require("../../common/guards/subscription-tier.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const signal_dto_1 = require("./dto/signal.dto");
let SignalController = class SignalController {
    signalService;
    constructor(signalService) {
        this.signalService = signalService;
    }
    async getSignals(user, pagination) {
        const page = pagination.page ? parseInt(pagination.page, 10) : 1;
        const limit = pagination.limit ? parseInt(pagination.limit, 10) : 10;
        return this.signalService.getSignalsForUser(user.id, user.planFeatures, page, limit);
    }
    async createSignal(user, dto) {
        return this.signalService.publishSignal({
            ...dto,
            authorId: user.id
        });
    }
    async updateStatus(id, dto) {
        return this.signalService.updateSignalState(parseInt(id, 10), dto.status, dto.triggerPrice);
    }
};
exports.SignalController = SignalController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List available signals for user tier' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], SignalController.prototype, "getSignals", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('VIP_SIGNALS:CREATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new VIP Signal (Analysts only)' }),
    (0, swagger_1.ApiBody)({ type: signal_dto_1.CreateSignalDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, signal_dto_1.CreateSignalDto]),
    __metadata("design:returntype", Promise)
], SignalController.prototype, "createSignal", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.Permissions)('VIP_SIGNALS:UPDATE'),
    (0, swagger_1.ApiOperation)({ summary: 'Update signal status (e.g. TARGET_REACHED)' }),
    (0, swagger_1.ApiBody)({ type: signal_dto_1.UpdateSignalStatusDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, signal_dto_1.UpdateSignalStatusDto]),
    __metadata("design:returntype", Promise)
], SignalController.prototype, "updateStatus", null);
exports.SignalController = SignalController = __decorate([
    (0, swagger_1.ApiTags)('VIP Signals'),
    (0, common_1.Controller)('signals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, subscription_tier_guard_1.SubscriptionTierGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [signal_service_1.SignalService])
], SignalController);
//# sourceMappingURL=signal.controller.js.map