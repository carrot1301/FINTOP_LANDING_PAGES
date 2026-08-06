import { PrismaService } from '../../common/database/prisma.service';
import { MarketService } from '../market/market.service';
import { MarketIntelligenceService } from '../market/market-intelligence.service';
import { PortfolioService } from '../portfolio/portfolio.service';
export declare class ResearchDataAggregatorService {
    private readonly prisma;
    private readonly marketService;
    private readonly intelligenceService;
    private readonly portfolioService;
    private readonly logger;
    constructor(prisma: PrismaService, marketService: MarketService, intelligenceService: MarketIntelligenceService, portfolioService: PortfolioService);
    aggregate(reportType: string, subject: string, dateRange?: {
        start_date: string;
        end_date: string;
    }): Promise<{
        report_type: string;
        subject: string;
        data_sources: string[];
        financials: any;
        quant: any;
        backtest: any;
        optimizer: any;
        market_intelligence: any;
        warnings: string[];
    }>;
}
