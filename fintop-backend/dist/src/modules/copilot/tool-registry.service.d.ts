import { MarketService } from '../market/market.service';
import { MarketIntelligenceService } from '../market/market-intelligence.service';
import { PortfolioService } from '../portfolio/portfolio.service';
export interface ToolDeclaration {
    name: string;
    description: string;
    parameters: Record<string, any>;
}
export interface ToolResult {
    name: string;
    success: boolean;
    data?: any;
    error?: string;
}
export declare class ToolRegistryService {
    private readonly marketService;
    private readonly intelligenceService;
    private readonly portfolioService;
    private readonly logger;
    private readonly tools;
    constructor(marketService: MarketService, intelligenceService: MarketIntelligenceService, portfolioService: PortfolioService);
    getDeclarations(): ToolDeclaration[];
    listTools(): {
        name: string;
        description: string;
    }[];
    execute(name: string, args: Record<string, any>): Promise<ToolResult>;
    private registerAllTools;
    private register;
}
