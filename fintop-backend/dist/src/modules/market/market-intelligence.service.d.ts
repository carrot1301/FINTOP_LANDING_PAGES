import { PrismaService } from '../../common/database/prisma.service';
import { MarketDataProviderService } from './market-data-provider.service';
import { Prisma } from '@prisma/client';
export declare class MarketIntelligenceService {
    private readonly prisma;
    private readonly provider;
    private readonly logger;
    constructor(prisma: PrismaService, provider: MarketDataProviderService);
    private formatDateStr;
    getSectorRotation(period: string, limit: number, tradeDate?: string): Promise<any[]>;
    getSectorRotationHistory(sectorCode: string, startDate: string, endDate: string): Promise<{
        id: number;
        createdAt: Date;
        tradeDate: Date;
        sectorCode: string;
        sectorName: string;
        return1d: Prisma.Decimal | null;
        return1w: Prisma.Decimal | null;
        return1m: Prisma.Decimal | null;
        return3m: Prisma.Decimal | null;
        return6m: Prisma.Decimal | null;
        returnYtd: Prisma.Decimal | null;
        relativeStrength: Prisma.Decimal | null;
        rank1m: number | null;
        rank3m: number | null;
    }[]>;
    getMoneyFlow(tradeDateStr: string, groupBy: string): Promise<any[]>;
    private aggregateMoneyFlow;
    getMoneyFlowHistory(startDate: string, endDate: string, groupBy: string): Promise<{
        tradeDate: string;
        flows: any[];
    }[]>;
    getForeignFlow(tradeDateStr: string, groupBy: string): Promise<any[]>;
    private aggregateForeignFlow;
    getForeignFlowHistory(startDate: string, endDate: string, groupBy: string): Promise<{
        tradeDate: string;
        flows: any[];
    }[]>;
    getMarketBreadth(tradeDateStr: string, exchange: string): Promise<any>;
    getMarketBreadthHistory(startDate: string, endDate: string, exchange: string): Promise<{
        id: number;
        createdAt: Date;
        exchange: string;
        tradeDate: Date;
        advancingCount: number;
        decliningCount: number;
        unchangedCount: number;
        totalCount: number;
        advanceDeclineRatio: Prisma.Decimal | null;
        newHighCount: number | null;
        newLowCount: number | null;
        aboveMa20Count: number | null;
        aboveMa50Count: number | null;
        aboveMa200Count: number | null;
    }[]>;
    getMarketRegime(indexCode: string, tradeDateStr?: string): Promise<{
        close: Prisma.Decimal;
        id: number;
        createdAt: Date;
        tradeDate: Date;
        indexCode: string;
        ema20: Prisma.Decimal | null;
        ema50: Prisma.Decimal | null;
        ema200: Prisma.Decimal | null;
        atr: Prisma.Decimal | null;
        adx: Prisma.Decimal | null;
        regime: string;
        riskScore: number | null;
        explanation: string | null;
    } | {
        tradeDate: Date;
        indexCode: string;
        close: number;
        ema20: number;
        ema50: number;
        ema200: number;
        atr: number;
        adx: number;
        regime: string;
        riskScore: number;
        explanation: string;
    } | {
        tradeDate: Date;
        indexCode: string;
        close: Prisma.Decimal;
        ema20: Prisma.Decimal;
        ema50: Prisma.Decimal;
        ema200: Prisma.Decimal;
        atr: Prisma.Decimal;
        adx: Prisma.Decimal;
        regime: string;
        riskScore: number;
        explanation: string;
    }>;
    getMarketRegimeHistory(indexCode: string, startDate: string, endDate: string): Promise<{
        close: Prisma.Decimal;
        id: number;
        createdAt: Date;
        tradeDate: Date;
        indexCode: string;
        ema20: Prisma.Decimal | null;
        ema50: Prisma.Decimal | null;
        ema200: Prisma.Decimal | null;
        atr: Prisma.Decimal | null;
        adx: Prisma.Decimal | null;
        regime: string;
        riskScore: number | null;
        explanation: string | null;
    }[]>;
    private computeRegimeForData;
    getSummary(tradeDateStr?: string): Promise<{
        trade_date: string;
        market_regime: {
            index_code: string;
            close: number;
            regime: string;
            risk_score: number | null;
            explanation: string | null;
            ema20: number;
            ema50: number;
            ema200: number;
            atr: number;
            adx: number;
        };
        sector_rotation: {
            sectorCode: any;
            sectorName: any;
            return1d: number;
            return1w: number;
            return1m: number;
            return3m: number;
            relativeStrength: number;
            rank1m: any;
            rank3m: any;
        }[];
        money_flow: any[];
        foreign_flow: any[];
        market_breadth: any;
        warnings: never[];
    }>;
    refreshIntelligenceData(tradeDateStr?: string): Promise<{
        status: string;
        date: string;
    }>;
    exportCSV(tradeDateStr?: string): Promise<string>;
}
