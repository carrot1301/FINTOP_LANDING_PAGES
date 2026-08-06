import { SIGNAL_DIRECTION, SUBSCRIPTION_TIER, SIGNAL_STATUS } from '@prisma/client';
export declare class CreateSignalDto {
    stockId: number;
    direction: SIGNAL_DIRECTION;
    entryPrice: number;
    cutLossPrice: number;
    targetPrice: number;
    notes?: string;
    minTierAccess?: SUBSCRIPTION_TIER;
}
export declare class UpdateSignalStatusDto {
    status: SIGNAL_STATUS;
    triggerPrice: number;
}
