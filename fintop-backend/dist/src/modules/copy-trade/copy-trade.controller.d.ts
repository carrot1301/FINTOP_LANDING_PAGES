import { CopyTradeService } from './copy-trade.service';
import { RECORD_STATUS } from '@prisma/client';
export declare class CopyTradeController {
    private readonly copyTradeService;
    constructor(copyTradeService: CopyTradeService);
    getMasters(activeOnly?: string): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: import("@prisma/client-runtime-utils").Decimal;
        followers: number;
        profit: import("@prisma/client-runtime-utils").Decimal;
        winRate: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getMaster(id: string): Promise<{
        copiers: {
            name: string;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profit: import("@prisma/client-runtime-utils").Decimal;
            masterId: number;
            capital: import("@prisma/client-runtime-utils").Decimal;
            multiplier: import("@prisma/client-runtime-utils").Decimal;
        }[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: import("@prisma/client-runtime-utils").Decimal;
        followers: number;
        profit: import("@prisma/client-runtime-utils").Decimal;
        winRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    createMaster(dto: {
        name: string;
        strategy: string;
        aum: number;
        profit?: number;
        winRate?: number;
    }): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: import("@prisma/client-runtime-utils").Decimal;
        followers: number;
        profit: import("@prisma/client-runtime-utils").Decimal;
        winRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    updateMaster(id: string, dto: {
        name?: string;
        strategy?: string;
        aum?: number;
        profit?: number;
        winRate?: number;
        status?: RECORD_STATUS;
    }): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: import("@prisma/client-runtime-utils").Decimal;
        followers: number;
        profit: import("@prisma/client-runtime-utils").Decimal;
        winRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deleteMaster(id: string): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: import("@prisma/client-runtime-utils").Decimal;
        followers: number;
        profit: import("@prisma/client-runtime-utils").Decimal;
        winRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getCopiers(): Promise<({
        master: {
            name: string;
        };
    } & {
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profit: import("@prisma/client-runtime-utils").Decimal;
        masterId: number;
        capital: import("@prisma/client-runtime-utils").Decimal;
        multiplier: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    createCopier(dto: {
        name: string;
        masterId: number;
        capital: number;
        multiplier: number;
    }): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profit: import("@prisma/client-runtime-utils").Decimal;
        masterId: number;
        capital: import("@prisma/client-runtime-utils").Decimal;
        multiplier: import("@prisma/client-runtime-utils").Decimal;
    }>;
    updateCopier(id: string, dto: {
        multiplier?: number;
        profit?: number;
        status?: RECORD_STATUS;
    }): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profit: import("@prisma/client-runtime-utils").Decimal;
        masterId: number;
        capital: import("@prisma/client-runtime-utils").Decimal;
        multiplier: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deleteCopier(id: string): Promise<{
        success: boolean;
    }>;
    getOrders(): Promise<({
        master: {
            name: string;
        };
    } & {
        symbol: string;
        status: string;
        id: number;
        action: string;
        createdAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    createOrder(dto: {
        masterId: number;
        symbol: string;
        action: string;
        price: number;
        quantity: number;
        accounts: number;
        status?: string;
        successRate?: number;
    }): Promise<{
        symbol: string;
        status: string;
        id: number;
        action: string;
        createdAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
    deleteOrder(id: string): Promise<{
        symbol: string;
        status: string;
        id: number;
        action: string;
        createdAt: Date;
        price: import("@prisma/client-runtime-utils").Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: import("@prisma/client-runtime-utils").Decimal;
    }>;
}
