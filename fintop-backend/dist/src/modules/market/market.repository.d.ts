import { PrismaService } from '../../common/database/prisma.service';
import { STOCK_STATUS } from '@prisma/client';
export declare class MarketRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findStockBySymbol(symbol: string): Promise<({
        industry: ({
            sector: {
                name: string;
                description: string | null;
                status: import("@prisma/client").$Enums.RECORD_STATUS;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                code: string;
            };
        } & {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            sectorId: number;
        }) | null;
        exchange: {
            name: string;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            code: import("@prisma/client").$Enums.EXCHANGE_CODE;
        };
    } & {
        symbol: string;
        description: string | null;
        status: import("@prisma/client").$Enums.STOCK_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isin: string | null;
        companyName: string;
        exchangeId: number;
        industryId: number | null;
        order: number;
        analyst: string | null;
        identify_trend: string | null;
        act: string | null;
        rsi_mfi: string | null;
        delta_rsi: string | null;
        trading_price_range: string | null;
        resistance_range: string | null;
        support_range: string | null;
        top_status: number;
    }) | null>;
    getStocks(params: {
        skip?: number;
        take?: number;
        exchangeId?: number;
        sectorId?: number;
        status?: STOCK_STATUS;
    }): Promise<({
        industry: ({
            sector: {
                name: string;
                description: string | null;
                status: import("@prisma/client").$Enums.RECORD_STATUS;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                code: string;
            };
        } & {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            sectorId: number;
        }) | null;
        exchange: {
            name: string;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            code: import("@prisma/client").$Enums.EXCHANGE_CODE;
        };
    } & {
        symbol: string;
        description: string | null;
        status: import("@prisma/client").$Enums.STOCK_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isin: string | null;
        companyName: string;
        exchangeId: number;
        industryId: number | null;
        order: number;
        analyst: string | null;
        identify_trend: string | null;
        act: string | null;
        rsi_mfi: string | null;
        delta_rsi: string | null;
        trading_price_range: string | null;
        resistance_range: string | null;
        support_range: string | null;
        top_status: number;
    })[]>;
    getSectors(): Promise<({
        industries: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            sectorId: number;
        }[];
    } & {
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
    })[]>;
    getHistoricalOHLCV(stockId: number, startDate: Date, endDate: Date): Promise<{
        close: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
        id: bigint;
        createdAt: Date;
        stockId: number;
        open: import("@prisma/client-runtime-utils").Decimal;
        high: import("@prisma/client-runtime-utils").Decimal;
        low: import("@prisma/client-runtime-utils").Decimal;
        volume: bigint;
        adjClose: import("@prisma/client-runtime-utils").Decimal | null;
    }[]>;
}
