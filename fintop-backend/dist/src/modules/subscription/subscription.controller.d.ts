import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getSubscription(user: any): Promise<({
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
            price: import("@prisma/client-runtime-utils").Decimal;
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
    }) | {
        userId: any;
        tierLevel: string;
        status: string;
    }>;
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
        price: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        durationDays: number;
    }[]>;
}
