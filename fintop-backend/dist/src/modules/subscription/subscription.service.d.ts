import { PrismaService } from '../../common/database/prisma.service';
import { Prisma } from '@prisma/client';
export declare class SubscriptionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getPlans(): Promise<{
        name: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RECORD_STATUS;
        id: number;
        createdAt: Date;
        tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
        updatedAt: Date;
        deletedAt: Date | null;
        features: string | null;
        price: Prisma.Decimal;
        currency: string;
        durationDays: number;
    }[]>;
    getActiveSubscription(userId: number): Promise<({
        plan: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            updatedAt: Date;
            deletedAt: Date | null;
            features: string | null;
            price: Prisma.Decimal;
            currency: string;
            durationDays: number;
        };
    } & {
        status: import("@prisma/client").$Enums.SUBSCRIPTION_STATUS;
        id: bigint;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        deletedAt: Date | null;
        endDate: Date;
        planId: number;
        startDate: Date;
        isPermanent: boolean;
    }) | null>;
    activateSubscription(userId: number, planId: number, transactionContext?: Prisma.TransactionClient): Promise<{
        status: import("@prisma/client").$Enums.SUBSCRIPTION_STATUS;
        id: bigint;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        deletedAt: Date | null;
        endDate: Date;
        planId: number;
        startDate: Date;
        isPermanent: boolean;
    }>;
    expireSubscriptions(): Promise<{
        expiredCount: number;
    }>;
}
