import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { RedisService } from '../../common/redis/redis.service';
import { SIGNAL_STATUS, SIGNAL_DIRECTION, AUDIT_SOURCE, SUBSCRIPTION_TIER, Prisma } from '@prisma/client';
import { SignalGateway } from '../websocket/signal.gateway';

export interface PublishSignalDto {
  stockId: number;
  authorId: number;
  direction: SIGNAL_DIRECTION;
  entryPrice: number;
  cutLossPrice: number;
  targetPrice: number;
  notes?: string;
  minTierAccess?: SUBSCRIPTION_TIER;
}

@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => SignalGateway))
    private readonly signalGateway: SignalGateway,
  ) {}

  async publishSignal(dto: PublishSignalDto) {
    const signal = await this.prisma.$transaction(async (tx) => {
      const signal = await tx.vipSignal.create({
        data: {
          stockId: dto.stockId,
          authorId: dto.authorId,
          direction: dto.direction,
          entryPrice: new Prisma.Decimal(dto.entryPrice),
          cutLossPrice: new Prisma.Decimal(dto.cutLossPrice),
          targetPrice: new Prisma.Decimal(dto.targetPrice),
          notes: dto.notes,
          status: SIGNAL_STATUS.PUBLISHED,
          minTierAccess: dto.minTierAccess || SUBSCRIPTION_TIER.GOLD,
          publishedAt: new Date(),
        },
      });

      await tx.signalTarget.create({
        data: {
          signalId: signal.id,
          price: new Prisma.Decimal(dto.targetPrice),
          targetIndex: 1,
        }
      });

      await tx.signalExecutionLog.create({
        data: {
          signalId: signal.id,
          fromStatus: SIGNAL_STATUS.DRAFT,
          toStatus: SIGNAL_STATUS.PUBLISHED,
          reason: 'Initial Publish',
        }
      });

      await this.auditService.log({
        userId: dto.authorId,
        source: AUDIT_SOURCE.SYSTEM,
        action: 'SIGNAL_PUBLISHED',
        tableName: 'vip_signals',
        recordId: signal.id.toString(),
      });

      await this.redisService.getClient().set(
        `signal:latest`,
        JSON.stringify(signal),
        'EX',
        86400
      );

      return signal;
    });

    // Realtime websocket broadcast
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
    } catch (err) {
      this.logger.error(`Realtime signal broadcast failed: ${err.message}`);
    }

    return signal;
  }

  async updateSignalState(signalId: number, newState: SIGNAL_STATUS, triggerPrice: number) {
    return this.prisma.$transaction(async (tx) => {
      const signal = await tx.vipSignal.findUnique({ where: { id: signalId } });
      if (!signal) throw new NotFoundException('Signal not found');
      if (signal.status === SIGNAL_STATUS.CLOSED) {
        throw new BadRequestException('Signal is already closed');
      }
      if (signal.status === newState) {
        return signal; // Idempotent
      }

      const updatedSignal = await tx.vipSignal.update({
        where: { id: signalId },
        data: {
          status: newState,
          closedAt: (newState === SIGNAL_STATUS.CLOSED || newState === SIGNAL_STATUS.REACHED_TARGET || newState === SIGNAL_STATUS.CUT_LOSS) ? new Date() : null,
        }
      });

      await tx.signalExecutionLog.create({
        data: {
          signalId,
          fromStatus: signal.status,
          toStatus: newState,
          triggerPrice: new Prisma.Decimal(triggerPrice),
          reason: `Transitioned to ${newState}`,
        }
      });

      await this.auditService.log({
        source: AUDIT_SOURCE.SYSTEM,
        action: `SIGNAL_${newState}`,
        tableName: 'vip_signals',
        recordId: signal.id.toString(),
      });

      return updatedSignal;
    });
  }

  async getSignalsForUser(userId: number, userTier: SUBSCRIPTION_TIER, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Include all non-DRAFT signals so the frontend can render status badges
    // (PUBLISHED, REACHED_TARGET, CUT_LOSS, CLOSED)
    const visibleStatuses = [
      SIGNAL_STATUS.PUBLISHED,
      SIGNAL_STATUS.REACHED_TARGET,
      SIGNAL_STATUS.CUT_LOSS,
      SIGNAL_STATUS.CLOSED,
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
      const locked = !this.isTierAllowed(userTier, s.minTierAccess);
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

  private isTierAllowed(userTier: SUBSCRIPTION_TIER, minTier: SUBSCRIPTION_TIER): boolean {
    const tierHierarchy = {
      STANDARD: 1,
      SILVER: 2,
      GOLD: 3,
      DIAMOND: 4,
    };
    return (tierHierarchy[userTier] || 0) >= (tierHierarchy[minTier] || 0);
  }
}

