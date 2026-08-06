"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteNormalizerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let QuoteNormalizerService = class QuoteNormalizerService {
    normalizeOHLCV(raw) {
        return {
            symbol: raw.symbol.trim().toUpperCase(),
            date: new Date(raw.date),
            open: new client_1.Prisma.Decimal(raw.open || 0),
            high: new client_1.Prisma.Decimal(raw.high || 0),
            low: new client_1.Prisma.Decimal(raw.low || 0),
            close: new client_1.Prisma.Decimal(raw.close || 0),
            volume: BigInt(raw.volume || 0),
        };
    }
};
exports.QuoteNormalizerService = QuoteNormalizerService;
exports.QuoteNormalizerService = QuoteNormalizerService = __decorate([
    (0, common_1.Injectable)()
], QuoteNormalizerService);
//# sourceMappingURL=quote-normalizer.service.js.map