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
var ToolRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistryService = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("../market/market.service");
const market_intelligence_service_1 = require("../market/market-intelligence.service");
const portfolio_service_1 = require("../portfolio/portfolio.service");
let ToolRegistryService = ToolRegistryService_1 = class ToolRegistryService {
    marketService;
    intelligenceService;
    portfolioService;
    logger = new common_1.Logger(ToolRegistryService_1.name);
    tools = new Map();
    constructor(marketService, intelligenceService, portfolioService) {
        this.marketService = marketService;
        this.intelligenceService = intelligenceService;
        this.portfolioService = portfolioService;
        this.registerAllTools();
    }
    getDeclarations() {
        return Array.from(this.tools.values()).map(t => t.declaration);
    }
    listTools() {
        return Array.from(this.tools.values()).map(t => ({
            name: t.declaration.name,
            description: t.declaration.description,
        }));
    }
    async execute(name, args) {
        const entry = this.tools.get(name);
        if (!entry) {
            this.logger.warn(`Tool not found: ${name}`);
            return { name, success: false, error: `Unknown tool: ${name}` };
        }
        try {
            this.logger.log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);
            const data = await entry.handler(args);
            return { name, success: true, data };
        }
        catch (err) {
            this.logger.error(`Tool ${name} failed: ${err.message}`);
            return { name, success: false, error: err.message };
        }
    }
    registerAllTools() {
        this.register({
            declaration: {
                name: 'get_stock_info',
                description: 'Look up detailed information for a Vietnam stock by its ticker symbol. Returns company name, exchange, industry, sector, analyst ratings, trend, support/resistance levels, and the latest realtime quote if available.',
                parameters: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                            description: 'Stock ticker symbol, e.g. FPT, VNM, HPG, VCB',
                        },
                    },
                    required: ['symbol'],
                },
            },
            handler: async (args) => {
                return this.marketService.getStock(String(args.symbol).toUpperCase().trim());
            },
        });
        this.register({
            declaration: {
                name: 'get_market_regime',
                description: 'Get the current market regime signal for a Vietnam market index. Returns regime state (Bull/Bear/Neutral/Recovery), risk score (0-100), volatility metrics (ATR, ADX), and an explanation of the current market conditions.',
                parameters: {
                    type: 'object',
                    properties: {
                        index_code: {
                            type: 'string',
                            description: 'Market index code. Default is VNINDEX. Other options: HNX30, VN30.',
                        },
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses the latest available date.',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getMarketRegime(args.index_code || 'VNINDEX', args.trade_date || undefined);
            },
        });
        this.register({
            declaration: {
                name: 'get_sector_rotation',
                description: 'Get ranked sector performance data showing which sectors are leading or lagging. Returns sector name, return percentages (1D, 1W, 1M, 3M), relative strength, and ranking.',
                parameters: {
                    type: 'object',
                    properties: {
                        period: {
                            type: 'string',
                            description: 'Performance period: 1D, 1W, 1M, or 3M. Default is 1M.',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of sectors to return. Default is 10.',
                        },
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses latest.',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getSectorRotation(args.period || '1M', args.limit || 10, args.trade_date || undefined);
            },
        });
        this.register({
            declaration: {
                name: 'get_market_breadth',
                description: 'Get market breadth data showing the ratio of advancing vs declining stocks. Returns advancing count, declining count, unchanged count, advance/decline ratio, and counts of stocks above key moving averages (MA20, MA50, MA200).',
                parameters: {
                    type: 'object',
                    properties: {
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses latest.',
                        },
                        exchange: {
                            type: 'string',
                            description: 'Exchange filter: ALL, HOSE, HNX, UPCOM. Default is ALL.',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getMarketBreadth(args.trade_date || new Date().toISOString(), args.exchange || 'ALL');
            },
        });
        this.register({
            declaration: {
                name: 'get_money_flow',
                description: 'Get money flow tracker data showing capital inflows and outflows by sector or by stock. Helps identify where institutional money is flowing.',
                parameters: {
                    type: 'object',
                    properties: {
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses latest.',
                        },
                        group_by: {
                            type: 'string',
                            description: 'Group results by "sector" or "stock". Default is "sector".',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getMoneyFlow(args.trade_date || new Date().toISOString(), args.group_by || 'sector');
            },
        });
        this.register({
            declaration: {
                name: 'get_foreign_flow',
                description: 'Get foreign investor flow data showing net buy/sell activity by foreign institutions. Helps track whether foreign investors are accumulating or distributing in specific sectors or stocks.',
                parameters: {
                    type: 'object',
                    properties: {
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses latest.',
                        },
                        group_by: {
                            type: 'string',
                            description: 'Group results by "sector" or "stock". Default is "sector".',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getForeignFlow(args.trade_date || new Date().toISOString(), args.group_by || 'sector');
            },
        });
        this.register({
            declaration: {
                name: 'get_portfolio_detail',
                description: 'Get detailed information about a specific investment portfolio including current NAV, cash balance, individual stock holdings with quantities, entry prices, current prices, P&L, and allocation percentages.',
                parameters: {
                    type: 'object',
                    properties: {
                        portfolio_id: {
                            type: 'number',
                            description: 'The numeric ID of the portfolio to look up.',
                        },
                    },
                    required: ['portfolio_id'],
                },
            },
            handler: async (args) => {
                return this.portfolioService.getPortfolioDetail(Number(args.portfolio_id), 1, 'DIAMOND');
            },
        });
        this.register({
            declaration: {
                name: 'get_intelligence_summary',
                description: 'Get the all-in-one market intelligence summary including market regime, sector rotation rankings, money flow, foreign flow, and market breadth data combined into a single comprehensive overview. Use this when the user asks a general question about "the market today" or wants an overall market assessment.',
                parameters: {
                    type: 'object',
                    properties: {
                        trade_date: {
                            type: 'string',
                            description: 'Trade date in YYYY-MM-DD format. If omitted, uses latest.',
                        },
                    },
                    required: [],
                },
            },
            handler: async (args) => {
                return this.intelligenceService.getSummary(args.trade_date || undefined);
            },
        });
        this.logger.log(`ToolRegistry initialized with ${this.tools.size} tools.`);
    }
    register(entry) {
        this.tools.set(entry.declaration.name, entry);
    }
};
exports.ToolRegistryService = ToolRegistryService;
exports.ToolRegistryService = ToolRegistryService = ToolRegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [market_service_1.MarketService,
        market_intelligence_service_1.MarketIntelligenceService,
        portfolio_service_1.PortfolioService])
], ToolRegistryService);
//# sourceMappingURL=tool-registry.service.js.map