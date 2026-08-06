import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBSCRIPTION_TIER } from '@prisma/client';
export declare const TIER_KEY = "subscription_tier";
export declare const SubscriptionTier: (tier: SUBSCRIPTION_TIER) => import("@nestjs/common").CustomDecorator<string>;
export declare class SubscriptionTierGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
