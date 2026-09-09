import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { RedisService } from '../../common/redis/redis.service';
import { Prisma } from '@prisma/client';
export interface CreatePortfolioDto {
    name: string;
    description?: string;
    managerId: number;
    initialCapital: number;
}
export interface AddHoldingDto {
    portfolioId: number;
    stockId: number;
    quantity: number;
    avgEntryPrice: number;
    currentPrice: number;
}
export declare class PortfolioService {
    private readonly prisma;
    private readonly auditService;
    private readonly redisService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService, redisService: RedisService);
    createPortfolio(dto: CreatePortfolioDto): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.PORTFOLIO_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        initialCapital: Prisma.Decimal;
        currentNav: Prisma.Decimal;
        cashBalance: Prisma.Decimal;
        managerId: number | null;
    }>;
    addHolding(dto: AddHoldingDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        stockId: number;
        portfolioId: number;
        quantity: bigint;
        avgEntryPrice: Prisma.Decimal;
        currentPrice: Prisma.Decimal;
    }>;
    calculateNav(portfolioId: number): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.PORTFOLIO_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        initialCapital: Prisma.Decimal;
        currentNav: Prisma.Decimal;
        cashBalance: Prisma.Decimal;
        managerId: number | null;
    }>;
    getPortfolios(userId: number, userFeatures: string[]): Promise<{
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
    getPortfolioDetail(portfolioId: number, userId: number, userFeatures: string[]): Promise<{
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
    private isTierAllowed;
}
