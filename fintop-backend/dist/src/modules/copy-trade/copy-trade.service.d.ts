import { PrismaService } from '../../common/database/prisma.service';
import { RECORD_STATUS, Prisma } from '@prisma/client';
export declare class CopyTradeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listMasters(activeOnly?: boolean): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: Prisma.Decimal;
        followers: number;
        profit: Prisma.Decimal;
        winRate: Prisma.Decimal;
    }[]>;
    getMaster(id: number): Promise<{
        copiers: {
            name: string;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            profit: Prisma.Decimal;
            masterId: number;
            capital: Prisma.Decimal;
            multiplier: Prisma.Decimal;
        }[];
    } & {
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: Prisma.Decimal;
        followers: number;
        profit: Prisma.Decimal;
        winRate: Prisma.Decimal;
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
        aum: Prisma.Decimal;
        followers: number;
        profit: Prisma.Decimal;
        winRate: Prisma.Decimal;
    }>;
    updateMaster(id: number, dto: {
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
        aum: Prisma.Decimal;
        followers: number;
        profit: Prisma.Decimal;
        winRate: Prisma.Decimal;
    }>;
    deleteMaster(id: number): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        strategy: string;
        aum: Prisma.Decimal;
        followers: number;
        profit: Prisma.Decimal;
        winRate: Prisma.Decimal;
    }>;
    listCopiers(): Promise<({
        master: {
            name: string;
        };
    } & {
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profit: Prisma.Decimal;
        masterId: number;
        capital: Prisma.Decimal;
        multiplier: Prisma.Decimal;
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
        profit: Prisma.Decimal;
        masterId: number;
        capital: Prisma.Decimal;
        multiplier: Prisma.Decimal;
    }>;
    updateCopier(id: number, dto: {
        multiplier?: number;
        profit?: number;
        status?: RECORD_STATUS;
    }): Promise<{
        name: string;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        profit: Prisma.Decimal;
        masterId: number;
        capital: Prisma.Decimal;
        multiplier: Prisma.Decimal;
    }>;
    deleteCopier(id: number): Promise<{
        success: boolean;
    }>;
    listOrders(): Promise<({
        master: {
            name: string;
        };
    } & {
        symbol: string;
        status: string;
        id: number;
        action: string;
        createdAt: Date;
        price: Prisma.Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: Prisma.Decimal;
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
        price: Prisma.Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: Prisma.Decimal;
    }>;
    deleteOrder(id: number): Promise<{
        symbol: string;
        status: string;
        id: number;
        action: string;
        createdAt: Date;
        price: Prisma.Decimal;
        quantity: bigint;
        time: Date;
        masterId: number;
        accounts: number;
        successRate: Prisma.Decimal;
    }>;
}
