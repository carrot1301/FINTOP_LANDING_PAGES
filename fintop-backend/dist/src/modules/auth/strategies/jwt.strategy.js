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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../common/database/prisma.service");
const redis_service_1 = require("../../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const subscription_helper_1 = require("../../../common/utils/subscription-helper");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    prisma;
    redisService;
    constructor(configService, prisma, redisService) {
        const secret = configService.get('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not configured');
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.configService = configService;
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async validate(payload) {
        const cacheKey = `user:permissions:${payload.sub}`;
        const cachedData = await this.redisService.getClient().get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
                subscriptions: {
                    where: {
                        status: 'ACTIVE',
                        endDate: { gt: new Date() },
                    },
                    include: {
                        plan: true,
                    },
                    orderBy: {
                        endDate: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!user || user.status !== client_1.RECORD_STATUS.ACTIVE || user.deletedAt) {
            throw new common_1.UnauthorizedException('User account is invalid or locked');
        }
        const roles = user.userRoles.map((ur) => ur.role.code);
        const permissions = new Set();
        for (const ur of user.userRoles) {
            for (const rp of ur.role.permissions) {
                permissions.add(`${rp.permission.module}:${rp.permission.action}`);
            }
        }
        const TIER_HIERARCHY_VALUES = {
            STANDARD: 1,
            SILVER: 2,
            GOLD: 3,
            DIAMOND: 4,
        };
        const ROLE_TIER_MAPPING = {
            SUPER_ADMIN: 'DIAMOND',
            CEO: 'DIAMOND',
            ASSISTANT_CEO: 'DIAMOND',
            ADMIN: 'DIAMOND',
            EDITOR_ADMIN: 'DIAMOND',
            SALE_ADMIN: 'DIAMOND',
            EXPERT: 'GOLD',
            EDITOR_PRO: 'GOLD',
            EDITOR: 'SILVER',
            SALE: 'SILVER',
            CLIENT_VIP: 'GOLD',
        };
        let maxUserTier = user.tierLevel;
        let maxUserLevel = TIER_HIERARCHY_VALUES[maxUserTier] || 1;
        for (const role of roles) {
            const mappedTier = ROLE_TIER_MAPPING[role];
            if (mappedTier) {
                const mappedLevel = TIER_HIERARCHY_VALUES[mappedTier] || 1;
                if (mappedLevel > maxUserLevel) {
                    maxUserLevel = mappedLevel;
                    maxUserTier = mappedTier;
                }
            }
        }
        const planFeatures = (0, subscription_helper_1.getFeaturesByTier)(maxUserTier);
        const userData = {
            id: user.id,
            email: user.email,
            tierLevel: maxUserTier,
            roles,
            permissions: Array.from(permissions),
            planFeatures,
        };
        await this.redisService.getClient().set(cacheKey, JSON.stringify(userData), 'EX', 60);
        return userData;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map