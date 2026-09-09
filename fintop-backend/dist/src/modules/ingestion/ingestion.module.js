"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const market_cache_service_1 = require("./market-cache.service");
const quote_normalizer_service_1 = require("./quote-normalizer.service");
const market_sync_service_1 = require("./market-sync.service");
const tcbs_market_adapter_1 = require("./tcbs-market-adapter");
let IngestionModule = class IngestionModule {
};
exports.IngestionModule = IngestionModule;
exports.IngestionModule = IngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            market_cache_service_1.MarketCacheService,
            quote_normalizer_service_1.QuoteNormalizerService,
            market_sync_service_1.MarketSyncService,
            tcbs_market_adapter_1.TcbsMarketAdapter,
        ],
        exports: [
            market_sync_service_1.MarketSyncService,
            tcbs_market_adapter_1.TcbsMarketAdapter,
        ],
    })
], IngestionModule);
//# sourceMappingURL=ingestion.module.js.map