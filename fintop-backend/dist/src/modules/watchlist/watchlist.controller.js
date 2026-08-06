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
exports.WatchlistController = void 0;
const common_1 = require("@nestjs/common");
const watchlist_service_1 = require("./watchlist.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const watchlist_dto_1 = require("./dto/watchlist.dto");
let WatchlistController = class WatchlistController {
    watchlistService;
    constructor(watchlistService) {
        this.watchlistService = watchlistService;
    }
    async getUserWatchlists(user) {
        return this.watchlistService.getUserWatchlists(user.id);
    }
    async createWatchlist(user, dto) {
        return this.watchlistService.createWatchlist(user.id, dto.name);
    }
    async addItem(user, watchlistId, dto) {
        return this.watchlistService.addStockToWatchlist(user.id, parseInt(watchlistId, 10), dto.stockId, dto.symbol);
    }
    async removeItem(user, watchlistId, symbol) {
        return this.watchlistService.removeStockFromWatchlist(user.id, parseInt(watchlistId, 10), symbol);
    }
};
exports.WatchlistController = WatchlistController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all watchlists for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WatchlistController.prototype, "getUserWatchlists", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new watchlist' }),
    (0, swagger_1.ApiBody)({ type: watchlist_dto_1.CreateWatchlistDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, watchlist_dto_1.CreateWatchlistDto]),
    __metadata("design:returntype", Promise)
], WatchlistController.prototype, "createWatchlist", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a stock to a watchlist' }),
    (0, swagger_1.ApiBody)({ type: watchlist_dto_1.AddStockDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, watchlist_dto_1.AddStockDto]),
    __metadata("design:returntype", Promise)
], WatchlistController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a stock from a watchlist by symbol' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WatchlistController.prototype, "removeItem", null);
exports.WatchlistController = WatchlistController = __decorate([
    (0, swagger_1.ApiTags)('Watchlists'),
    (0, common_1.Controller)('watchlists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [watchlist_service_1.WatchlistService])
], WatchlistController);
//# sourceMappingURL=watchlist.controller.js.map