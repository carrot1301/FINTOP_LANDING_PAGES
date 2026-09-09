import { SUBSCRIPTION_TIER, RECORD_STATUS } from '@prisma/client';
export declare class CreatePlanDto {
    name: string;
    description?: string;
    tierLevel: SUBSCRIPTION_TIER;
    price: number;
    currency?: string;
    durationDays: number;
    features?: string;
}
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    tierLevel?: SUBSCRIPTION_TIER;
    price?: number;
    currency?: string;
    durationDays?: number;
    features?: string;
    status?: RECORD_STATUS;
}
