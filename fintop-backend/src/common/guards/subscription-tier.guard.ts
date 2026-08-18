import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUBSCRIPTION_TIER, ROLE_CODE } from '@prisma/client';
import { isFeatureAllowed } from '../utils/subscription-helper';

export const TIER_KEY = 'subscription_tier';
export const SubscriptionTier = (tier: SUBSCRIPTION_TIER) => SetMetadata(TIER_KEY, tier);

@Injectable()
export class SubscriptionTierGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

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

    const premiumRoles: string[] = [
      'SUPER_ADMIN', 'CEO', 'DEVELOPER',
      'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO',
      'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT',
      'CLIENT_PRO', 'CLIENT_VIP', 'CLIENT_DIAMOND',
    ];

    const hasPremiumRole = user.roles?.some((r: string) => premiumRoles.includes(r)) || ['SILVER', 'PRO', 'GOLD', 'VIP', 'DIAMOND'].includes((user.tierLevel || '').toUpperCase());
    if (hasPremiumRole) {
      return true; // All PRO/VIP/Diamond and staff roles get full access to user site features
    }

    if (!isFeatureAllowed(user.planFeatures, requiredTier)) {
      throw new ForbiddenException(`Access requires ${requiredTier} subscription or higher.`);
    }

    return true;
  }
}
