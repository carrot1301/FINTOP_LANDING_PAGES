"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTierGuard = exports.SubscriptionTier = exports.TIER_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const subscription_helper_1 = require("../utils/subscription-helper");
exports.TIER_KEY = 'subscription_tier';
const SubscriptionTier = (tier) => (0, common_1.SetMetadata)(exports.TIER_KEY, tier);
exports.SubscriptionTier = SubscriptionTier;
let SubscriptionTierGuard = class SubscriptionTierGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredTier = this.reflector.getAllAndOverride(exports.TIER_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredTier) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException('User session not found');
        }
        const staffRoles = [
            'SUPER_ADMIN', 'CEO', 'DEVELOPER',
            'ASSISTANT_CEO', 'EDITOR_ADMIN', 'EDITOR_PRO',
            'EDITOR', 'SALE_ADMIN', 'SALE', 'EXPERT',
        ];
        const hasStaffRole = user.roles?.some((r) => staffRoles.includes(r));
        if (hasStaffRole) {
            return true;
        }
        if (!(0, subscription_helper_1.isFeatureAllowed)(user.planFeatures, requiredTier)) {
            throw new common_1.ForbiddenException(`Access requires ${requiredTier} subscription or higher.`);
        }
        return true;
    }
};
exports.SubscriptionTierGuard = SubscriptionTierGuard;
exports.SubscriptionTierGuard = SubscriptionTierGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], SubscriptionTierGuard);
//# sourceMappingURL=subscription-tier.guard.js.map