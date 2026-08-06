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
var SocketAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/database/prisma.service");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
let SocketAuthGuard = SocketAuthGuard_1 = class SocketAuthGuard {
    jwtService;
    prisma;
    configService;
    logger = new common_1.Logger(SocketAuthGuard_1.name);
    constructor(jwtService, prisma, configService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.configService = configService;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        try {
            const token = this.extractTokenFromHeader(client);
            if (!token)
                throw new websockets_1.WsException('Missing authentication token');
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    userRoles: {
                        include: {
                            role: true,
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
            if (!user || user.status !== 'ACTIVE') {
                throw new websockets_1.WsException('Invalid user');
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
            const roles = user.userRoles.map((ur) => ur.role.code);
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
            client.user = {
                ...user,
                planFeatures,
            };
            return true;
        }
        catch (error) {
            this.logger.error(`Socket auth failed: ${error.message}`);
            client.disconnect();
            return false;
        }
    }
    extractTokenFromHeader(client) {
        const authHeader = client.handshake?.headers?.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            return authHeader.split(' ')[1];
        }
        if (client.handshake?.auth?.token) {
            return client.handshake.auth.token;
        }
        if (client.handshake?.query?.token) {
            return client.handshake.query.token;
        }
        return undefined;
    }
};
exports.SocketAuthGuard = SocketAuthGuard;
exports.SocketAuthGuard = SocketAuthGuard = SocketAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], SocketAuthGuard);
//# sourceMappingURL=socket-auth.guard.js.map