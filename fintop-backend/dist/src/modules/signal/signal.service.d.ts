import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { RedisService } from '../../common/redis/redis.service';
import { SIGNAL_STATUS, SIGNAL_DIRECTION, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';
import { SignalGateway } from '../websocket/signal.gateway';
export interface PublishSignalDto {
    stockId: number;
    authorId: number;
    direction: SIGNAL_DIRECTION;
    entryPrice: number;
    cutLossPrice: number;
    targetPrice: number;
    notes?: string;
    minTierAccess?: SUBSCRIPTION_TIER;
}
export declare class SignalService {
    private readonly prisma;
    private readonly auditService;
    private readonly redisService;
    private readonly signalGateway;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService, redisService: RedisService, signalGateway: SignalGateway);
    publishSignal(dto: PublishSignalDto): Promise<{
        status: import("@prisma/client").$Enums.SIGNAL_STATUS;
        id: number;
        source: import("@prisma/client").$Enums.SIGNAL_SOURCE;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        stockId: number;
        direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        entryPrice: Prisma.Decimal;
        cutLossPrice: Prisma.Decimal;
        targetPrice: Prisma.Decimal;
        notes: string | null;
        publishedAt: Date | null;
        closedAt: Date | null;
        authorId: number | null;
    }>;
    updateSignalState(signalId: number, newState: SIGNAL_STATUS, triggerPrice: number): Promise<{
        status: import("@prisma/client").$Enums.SIGNAL_STATUS;
        id: number;
        source: import("@prisma/client").$Enums.SIGNAL_SOURCE;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        stockId: number;
        direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
        minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        entryPrice: Prisma.Decimal;
        cutLossPrice: Prisma.Decimal;
        targetPrice: Prisma.Decimal;
        notes: string | null;
        publishedAt: Date | null;
        closedAt: Date | null;
        authorId: number | null;
    }>;
    getSignalsForUser(userId: number, userFeatures: string[], page?: number, limit?: number): Promise<{
        data: {
            id: number;
            stockId: number;
            symbol: string;
            companyName: string;
            direction: import("@prisma/client").$Enums.SIGNAL_DIRECTION;
            status: import("@prisma/client").$Enums.SIGNAL_STATUS;
            minTierAccess: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            entryPrice: number | null;
            cutLossPrice: number | null;
            targetPrice: number | null;
            notes: string | null;
            publishedAt: Date | null;
            locked: boolean;
            author: {
                fullName: string;
                avatarUrl: string | null;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private isTierAllowed;
}
