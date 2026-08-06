import { SUBSCRIPTION_TIER } from '@prisma/client';
export declare function isFeatureAllowed(userFeatures: string[] | undefined | null, requiredTier: SUBSCRIPTION_TIER): boolean;
export declare function getFeaturesByTier(tier: SUBSCRIPTION_TIER): string[];
