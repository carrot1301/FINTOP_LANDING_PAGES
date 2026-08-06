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
exports.UpdateSignalStatusDto = exports.CreateSignalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateSignalDto {
    stockId;
    direction;
    entryPrice;
    cutLossPrice;
    targetPrice;
    notes;
    minTierAccess;
}
exports.CreateSignalDto = CreateSignalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSignalDto.prototype, "stockId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SIGNAL_DIRECTION }),
    (0, class_validator_1.IsEnum)(client_1.SIGNAL_DIRECTION),
    __metadata("design:type", String)
], CreateSignalDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSignalDto.prototype, "entryPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSignalDto.prototype, "cutLossPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSignalDto.prototype, "targetPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSignalDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SUBSCRIPTION_TIER, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SUBSCRIPTION_TIER),
    __metadata("design:type", String)
], CreateSignalDto.prototype, "minTierAccess", void 0);
class UpdateSignalStatusDto {
    status;
    triggerPrice;
}
exports.UpdateSignalStatusDto = UpdateSignalStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.SIGNAL_STATUS }),
    (0, class_validator_1.IsEnum)(client_1.SIGNAL_STATUS),
    __metadata("design:type", String)
], UpdateSignalStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateSignalStatusDto.prototype, "triggerPrice", void 0);
//# sourceMappingURL=signal.dto.js.map