import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketDataProviderService } from './market-data-provider.service';
import type { Response } from 'express';
export declare class MarketIntelligenceController {
    private readonly service;
    private readonly provider;
    constructor(service: MarketIntelligenceService, provider: MarketDataProviderService);
    getSectorRotation(period?: string, limit?: string, tradeDate?: string): Promise<any[]>;
    getSectorRotationHistory(sectorCode: string, startDate: string, endDate: string): Promise<{
        id: number;
        createdAt: Date;
        tradeDate: Date;
        sectorCode: string;
        sectorName: string;
        return1d: import("@prisma/client-runtime-utils").Decimal | null;
        return1w: import("@prisma/client-runtime-utils").Decimal | null;
        return1m: import("@prisma/client-runtime-utils").Decimal | null;
        return3m: import("@prisma/client-runtime-utils").Decimal | null;
        return6m: import("@prisma/client-runtime-utils").Decimal | null;
        returnYtd: import("@prisma/client-runtime-utils").Decimal | null;
        relativeStrength: import("@prisma/client-runtime-utils").Decimal | null;
        rank1m: number | null;
        rank3m: number | null;
    }[]>;
    getMoneyFlow(tradeDate?: string, groupBy?: string): Promise<any[]>;
    getMoneyFlowHistory(startDate: string, endDate: string, groupBy?: string): Promise<{
        tradeDate: string;
        flows: any[];
    }[]>;
    getForeignFlow(tradeDate?: string, groupBy?: string): Promise<any[]>;
    getForeignFlowHistory(startDate: string, endDate: string, groupBy?: string): Promise<{
        tradeDate: string;
        flows: any[];
    }[]>;
    getMarketBreadth(tradeDate?: string, exchange?: string): Promise<any>;
    getMarketBreadthHistory(startDate: string, endDate: string, exchange?: string): Promise<{
        id: number;
        createdAt: Date;
        exchange: string;
        tradeDate: Date;
        advancingCount: number;
        decliningCount: number;
        unchangedCount: number;
        totalCount: number;
        advanceDeclineRatio: import("@prisma/client-runtime-utils").Decimal | null;
        newHighCount: number | null;
        newLowCount: number | null;
        aboveMa20Count: number | null;
        aboveMa50Count: number | null;
        aboveMa200Count: number | null;
    }[]>;
    getMarketRegime(indexCode?: string, tradeDate?: string): Promise<{
        close: import("@prisma/client-runtime-utils").Decimal;
        id: number;
        createdAt: Date;
        tradeDate: Date;
        indexCode: string;
        ema20: import("@prisma/client-runtime-utils").Decimal | null;
        ema50: import("@prisma/client-runtime-utils").Decimal | null;
        ema200: import("@prisma/client-runtime-utils").Decimal | null;
        atr: import("@prisma/client-runtime-utils").Decimal | null;
        adx: import("@prisma/client-runtime-utils").Decimal | null;
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
        close: import("@prisma/client-runtime-utils").Decimal;
        ema20: import("@prisma/client-runtime-utils").Decimal;
        ema50: import("@prisma/client-runtime-utils").Decimal;
        ema200: import("@prisma/client-runtime-utils").Decimal;
        atr: import("@prisma/client-runtime-utils").Decimal;
        adx: import("@prisma/client-runtime-utils").Decimal;
        regime: string;
        riskScore: number;
        explanation: string;
    }>;
    getMarketRegimeHistory(indexCode: string, startDate: string, endDate: string): Promise<{
        close: import("@prisma/client-runtime-utils").Decimal;
        id: number;
        createdAt: Date;
        tradeDate: Date;
        indexCode: string;
        ema20: import("@prisma/client-runtime-utils").Decimal | null;
        ema50: import("@prisma/client-runtime-utils").Decimal | null;
        ema200: import("@prisma/client-runtime-utils").Decimal | null;
        atr: import("@prisma/client-runtime-utils").Decimal | null;
        adx: import("@prisma/client-runtime-utils").Decimal | null;
        regime: string;
        riskScore: number | null;
        explanation: string | null;
    }[]>;
    getSummary(tradeDate?: string): Promise<{
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
    getHealth(): Promise<Record<string, any>>;
    refreshData(tradeDate?: string): Promise<{
        status: string;
        date: string;
    }>;
    exportData(format?: string, tradeDate?: string, res?: Response): Promise<void>;
}
