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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SignalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const signal_gateway_1 = require("../websocket/signal.gateway");
const subscription_helper_1 = require("../../common/utils/subscription-helper");
let SignalService = SignalService_1 = class SignalService {
    prisma;
    auditService;
    redisService;
    signalGateway;
    logger = new common_1.Logger(SignalService_1.name);
    constructor(prisma, auditService, redisService, signalGateway) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.redisService = redisService;
        this.signalGateway = signalGateway;
    }
    async publishSignal(dto) {
        const signal = await this.prisma.$transaction(async (tx) => {
            const signal = await tx.vipSignal.create({
                data: {
                    stockId: dto.stockId,
                    authorId: dto.authorId,
                    direction: dto.direction,
                    entryPrice: new client_1.Prisma.Decimal(dto.entryPrice),
                    cutLossPrice: new client_1.Prisma.Decimal(dto.cutLossPrice),
                    targetPrice: new client_1.Prisma.Decimal(dto.targetPrice),
                    notes: dto.notes,
                    status: client_1.SIGNAL_STATUS.PUBLISHED,
                    minTierAccess: dto.minTierAccess || client_1.SUBSCRIPTION_TIER.GOLD,
                    publishedAt: new Date(),
                },
            });
            await tx.signalTarget.create({
                data: {
                    signalId: signal.id,
                    price: new client_1.Prisma.Decimal(dto.targetPrice),
                    targetIndex: 1,
                }
            });
            await tx.signalExecutionLog.create({
                data: {
                    signalId: signal.id,
                    fromStatus: client_1.SIGNAL_STATUS.DRAFT,
                    toStatus: client_1.SIGNAL_STATUS.PUBLISHED,
                    reason: 'Initial Publish',
                }
            });
            await this.auditService.log({
                userId: dto.authorId,
                source: client_1.AUDIT_SOURCE.SYSTEM,
                action: 'SIGNAL_PUBLISHED',
                tableName: 'vip_signals',
                recordId: signal.id.toString(),
            });
            await this.redisService.getClient().set(`signal:latest`, JSON.stringify(signal), 'EX', 86400);
            return signal;
        });
        try {
            const stock = await this.prisma.stock.findUnique({ where: { id: signal.stockId } });
            const author = await this.prisma.user.findUnique({ where: { id: signal.authorId || undefined } });
            await this.signalGateway.broadcastSignal(signal.minTierAccess, {
                id: signal.id,
                stockId: signal.stockId,
                symbol: stock?.symbol || 'UNKNOWN',
                companyName: stock?.companyName || 'UNKNOWN',
                direction: signal.direction,
                status: signal.status,
                minTierAccess: signal.minTierAccess,
                entryPrice: signal.entryPrice.toNumber(),
                cutLossPrice: signal.cutLossPrice.toNumber(),
                targetPrice: signal.targetPrice.toNumber(),
                notes: signal.notes,
                publishedAt: signal.publishedAt,
                author: author ? {
                    fullName: author.fullName,
                    avatarUrl: author.avatarUrl,
                } : null,
            });
        }
        catch (err) {
            this.logger.error(`Realtime signal broadcast failed: ${err.message}`);
        }
        return signal;
    }
    async updateSignalState(signalId, newState, triggerPrice) {
        return this.prisma.$transaction(async (tx) => {
            const signal = await tx.vipSignal.findUnique({ where: { id: signalId } });
            if (!signal)
                throw new common_1.NotFoundException('Signal not found');
            if (signal.status === client_1.SIGNAL_STATUS.CLOSED) {
                throw new common_1.BadRequestException('Signal is already closed');
            }
            if (signal.status === newState) {
                return signal;
            }
            const updatedSignal = await tx.vipSignal.update({
                where: { id: signalId },
                data: {
                    status: newState,
                    closedAt: (newState === client_1.SIGNAL_STATUS.CLOSED || newState === client_1.SIGNAL_STATUS.REACHED_TARGET || newState === client_1.SIGNAL_STATUS.CUT_LOSS) ? new Date() : null,
                }
            });
            await tx.signalExecutionLog.create({
                data: {
                    signalId,
                    fromStatus: signal.status,
                    toStatus: newState,
                    triggerPrice: new client_1.Prisma.Decimal(triggerPrice),
                    reason: `Transitioned to ${newState}`,
                }
            });
            await this.auditService.log({
                source: client_1.AUDIT_SOURCE.SYSTEM,
                action: `SIGNAL_${newState}`,
                tableName: 'vip_signals',
                recordId: signal.id.toString(),
            });
            return updatedSignal;
        });
    }
    async getSignalsForUser(userId, userFeatures, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const visibleStatuses = [
            client_1.SIGNAL_STATUS.PUBLISHED,
            client_1.SIGNAL_STATUS.REACHED_TARGET,
            client_1.SIGNAL_STATUS.CUT_LOSS,
            client_1.SIGNAL_STATUS.CLOSED,
        ];
        const total = await this.prisma.vipSignal.count({
            where: { status: { in: visibleStatuses } }
        });
        const signals = await this.prisma.vipSignal.findMany({
            where: { status: { in: visibleStatuses } },
            include: { stock: true, author: true },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit,
        });
        const mapped = signals.map(s => {
            const locked = !this.isTierAllowed(userFeatures, s.minTierAccess);
            return {
                id: s.id,
                stockId: s.stockId,
                symbol: s.stock.symbol,
                companyName: s.stock.companyName,
                direction: s.direction,
                status: s.status,
                minTierAccess: s.minTierAccess,
                entryPrice: locked ? null : s.entryPrice.toNumber(),
                cutLossPrice: locked ? null : s.cutLossPrice.toNumber(),
                targetPrice: locked ? null : s.targetPrice.toNumber(),
                notes: locked ? 'Nội dung V.I.P - Hãy nâng cấp tài khoản để xem tín hiệu chi tiết.' : s.notes,
                publishedAt: s.publishedAt,
                locked,
                author: s.author ? {
                    fullName: s.author.fullName,
                    avatarUrl: s.author.avatarUrl,
                } : null,
            };
        });
        return {
            data: mapped,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
    isTierAllowed(userFeatures, minTier) {
        return (0, subscription_helper_1.isFeatureAllowed)(userFeatures, minTier);
    }
};
exports.SignalService = SignalService;
exports.SignalService = SignalService = SignalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => signal_gateway_1.SignalGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        redis_service_1.RedisService,
        signal_gateway_1.SignalGateway])
], SignalService);
//# sourceMappingURL=signal.service.js.map