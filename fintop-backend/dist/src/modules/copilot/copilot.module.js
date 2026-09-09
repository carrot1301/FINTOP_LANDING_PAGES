"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotModule = void 0;
const common_1 = require("@nestjs/common");
const copilot_controller_1 = require("./copilot.controller");
const copilot_orchestrator_service_1 = require("./copilot-orchestrator.service");
const tool_registry_service_1 = require("./tool-registry.service");
const market_module_1 = require("../market/market.module");
const portfolio_module_1 = require("../portfolio/portfolio.module");
let CopilotModule = class CopilotModule {
};
exports.CopilotModule = CopilotModule;
exports.CopilotModule = CopilotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            market_module_1.MarketModule,
            portfolio_module_1.PortfolioModule,
        ],
        controllers: [copilot_controller_1.CopilotController],
        providers: [
            copilot_orchestrator_service_1.CopilotOrchestratorService,
            tool_registry_service_1.ToolRegistryService,
        ],
    })
], CopilotModule);
//# sourceMappingURL=copilot.module.js.map