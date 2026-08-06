"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchModule = void 0;
const common_1 = require("@nestjs/common");
const research_controller_1 = require("./research.controller");
const research_data_aggregator_service_1 = require("./research-data-aggregator.service");
const grounded_ai_service_1 = require("./grounded-ai.service");
const research_export_service_1 = require("./research-export.service");
const infra_module_1 = require("../../infra/infra.module");
const market_module_1 = require("../market/market.module");
const portfolio_module_1 = require("../portfolio/portfolio.module");
let ResearchModule = class ResearchModule {
};
exports.ResearchModule = ResearchModule;
exports.ResearchModule = ResearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            infra_module_1.InfraModule,
            market_module_1.MarketModule,
            portfolio_module_1.PortfolioModule,
        ],
        controllers: [research_controller_1.ResearchController],
        providers: [
            research_data_aggregator_service_1.ResearchDataAggregatorService,
            grounded_ai_service_1.GroundedAiService,
            research_export_service_1.ResearchExportService,
        ],
        exports: [
            research_data_aggregator_service_1.ResearchDataAggregatorService,
            grounded_ai_service_1.GroundedAiService,
            research_export_service_1.ResearchExportService,
        ],
    })
], ResearchModule);
//# sourceMappingURL=research.module.js.map