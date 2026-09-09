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
exports.AddStockDto = exports.CreateWatchlistDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWatchlistDto {
    name;
}
exports.CreateWatchlistDto = CreateWatchlistDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the watchlist' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWatchlistDto.prototype, "name", void 0);
class AddStockDto {
    stockId;
    symbol;
}
exports.AddStockDto = AddStockDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the stock to add', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], AddStockDto.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Symbol of the stock to add', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddStockDto.prototype, "symbol", void 0);
//# sourceMappingURL=watchlist.dto.js.map