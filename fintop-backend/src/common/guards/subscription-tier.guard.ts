import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBSCRIPTION_TIER, ROLE_CODE } from '@prisma/client';

export const TIER_KEY = 'subscription_tier';
export const SubscriptionTier = (tier: SUBSCRIPTION_TIER) => SetMetadata(TIER_KEY, tier);

const TierHierarchy: Record<SUBSCRIPTION_TIER, number> = {
  [SUBSCRIPTION_TIER.STANDARD]: 1,
  [SUBSCRIPTION_TIER.SILVER]: 2,
  [SUBSCRIPTION_TIER.GOLD]: 3,
  [SUBSCRIPTION_TIER.DIAMOND]: 4,
};

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<SUBSCRIPTION_TIER>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTier) {
      return true; // No tier required
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    if (user.roles?.includes(ROLE_CODE.SUPER_ADMIN)) {
      return true; // Super Admin bypasses tier restrictions
    }

    const userTierLevel = TierHierarchy[user.tierLevel as SUBSCRIPTION_TIER] || 0;
    const requiredTierLevel = TierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException(`Access requires ${requiredTier} subscription or higher.`);
    }

    return true;
  }
}
