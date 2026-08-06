import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getPortfolios(user: any): Promise<{
        initialCapital: number;
        currentNav: number;
        cashBalance: number;
        locked: boolean;
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.PORTFOLIO_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        managerId: number | null;
    }[]>;
    getPortfolioDetail(user: any, id: string): Promise<{
        id: number;
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.PORTFOLIO_STATUS;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        initialCapital: number;
        currentNav: number;
        cashBalance: number;
        cashAllocation: number;
        locked: boolean;
        holdings: {
            id: number;
            stockId: number;
            symbol: string;
            companyName: string;
            quantity: number;
            avgEntryPrice: number;
            currentPrice: number;
            value: number;
            allocation: number;
            profitLoss: number;
            profitLossPercent: number;
        }[];
    }>;
}
