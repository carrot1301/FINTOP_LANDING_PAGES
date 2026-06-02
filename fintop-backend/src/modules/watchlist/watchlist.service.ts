import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from '../../common/audit/audit.service';
import { AUDIT_SOURCE } from '@prisma/client';

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async createWatchlist(userId: number, name: string) {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_name: { userId, name } }
    });
    if (existing) throw new BadRequestException('Watchlist name already exists');

    const watchlist = await this.prisma.watchlist.create({
      data: { userId, name, isDefault: name === 'Default' }
    });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'WATCHLIST_CREATED',
      tableName: 'watchlists',
      recordId: watchlist.id.toString(),
    });

    return watchlist;
  }

  async getUserWatchlists(userId: number) {
    let watchlists = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            stock: true,
          }
        }
      }
    });

    if (watchlists.length === 0) {
      await this.createWatchlist(userId, 'Default');
      watchlists = await this.prisma.watchlist.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              stock: true,
            }
          }
        }
      });
    }

    return watchlists;
  }

  async addStockToWatchlist(userId: number, watchlistId: number, stockId?: number, symbol?: string) {
    const watchlist = await this.prisma.watchlist.findUnique({ where: { id: watchlistId } });
    if (!watchlist || watchlist.userId !== userId) throw new NotFoundException('Watchlist not found');

    let resolvedStockId = stockId;
    if (!resolvedStockId && symbol) {
      const stock = await this.prisma.stock.findUnique({ where: { symbol } });
      if (!stock) throw new NotFoundException(`Stock symbol ${symbol} not found`);
      resolvedStockId = stock.id;
    }

    if (!resolvedStockId) {
      throw new BadRequestException('Either stockId or symbol must be provided');
    }

    const item = await this.prisma.watchlistItem.upsert({
      where: { watchlistId_stockId: { watchlistId, stockId: resolvedStockId } },
      update: {},
      create: { watchlistId, stockId: resolvedStockId }
    });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'WATCHLIST_ITEM_ADDED',
      tableName: 'watchlist_items',
      recordId: item.id.toString(),
    });

    await this.redisService.getClient().del(`watchlist:user:${userId}`);
    return item;
  }

  async removeStockFromWatchlist(userId: number, watchlistId: number, symbol: string) {
    const watchlist = await this.prisma.watchlist.findUnique({ where: { id: watchlistId } });
    if (!watchlist || watchlist.userId !== userId) throw new NotFoundException('Watchlist not found');

    const stock = await this.prisma.stock.findUnique({ where: { symbol } });
    if (!stock) throw new NotFoundException(`Stock symbol ${symbol} not found`);

    try {
      await this.prisma.watchlistItem.delete({
        where: {
          watchlistId_stockId: {
            watchlistId,
            stockId: stock.id,
          }
        }
      });
    } catch (e) {
      throw new NotFoundException('Watchlist item not found');
    }

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'WATCHLIST_ITEM_REMOVED',
      tableName: 'watchlist_items',
      recordId: `${watchlistId}_${stock.id}`,
    });

    await this.redisService.getClient().del(`watchlist:user:${userId}`);
    return { success: true };
  }
}
