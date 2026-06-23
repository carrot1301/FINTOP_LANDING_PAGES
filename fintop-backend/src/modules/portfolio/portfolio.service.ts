import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { RedisService } from '../../common/redis/redis.service';
import { PORTFOLIO_STATUS, AUDIT_SOURCE, Prisma, SUBSCRIPTION_TIER } from '@prisma/client';
import { isFeatureAllowed } from '../../common/utils/subscription-helper';

export interface CreatePortfolioDto {
  name: string;
  description?: string;
  managerId: number;
  initialCapital: number;
}

export interface AddHoldingDto {
  portfolioId: number;
  stockId: number;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number;
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redisService: RedisService,
  ) {}

  async createPortfolio(dto: CreatePortfolioDto) {
    const portfolio = await this.prisma.recommendedPortfolio.create({
      data: {
        name: dto.name,
        description: dto.description,
        managerId: dto.managerId,
        initialCapital: new Prisma.Decimal(dto.initialCapital),
        currentNav: new Prisma.Decimal(dto.initialCapital),
        cashBalance: new Prisma.Decimal(dto.initialCapital),
        status: PORTFOLIO_STATUS.ACTIVE,
      },
    });

    await this.auditService.log({
      userId: dto.managerId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'PORTFOLIO_CREATED',
      tableName: 'recommended_portfolios',
      recordId: portfolio.id.toString(),
    });

    return portfolio;
  }

  async addHolding(dto: AddHoldingDto) {
    return this.prisma.$transaction(async (tx) => {
      const portfolio = await tx.recommendedPortfolio.findUnique({
        where: { id: dto.portfolioId }
      });
      if (!portfolio) throw new NotFoundException('Portfolio not found');
      
      const holdingCost = new Prisma.Decimal(dto.quantity).mul(new Prisma.Decimal(dto.avgEntryPrice));
      if (portfolio.cashBalance.lessThan(holdingCost)) {
        throw new BadRequestException('Insufficient cash balance in portfolio');
      }

      const holding = await tx.portfolioHolding.upsert({
        where: { portfolioId_stockId: { portfolioId: dto.portfolioId, stockId: dto.stockId } },
        update: {
          quantity: { increment: dto.quantity },
          currentPrice: new Prisma.Decimal(dto.currentPrice),
        },
        create: {
          portfolioId: dto.portfolioId,
          stockId: dto.stockId,
          quantity: BigInt(dto.quantity),
          avgEntryPrice: new Prisma.Decimal(dto.avgEntryPrice),
          currentPrice: new Prisma.Decimal(dto.currentPrice),
        }
      });

      await tx.recommendedPortfolio.update({
        where: { id: dto.portfolioId },
        data: {
          cashBalance: { decrement: holdingCost },
        }
      });

      await this.auditService.log({
        source: AUDIT_SOURCE.SYSTEM,
        action: 'HOLDING_ADDED',
        tableName: 'portfolio_holdings',
        recordId: holding.id.toString(),
      });

      return holding;
    });
  }

  async calculateNav(portfolioId: number) {
    return this.prisma.$transaction(async (tx) => {
      const portfolio = await tx.recommendedPortfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });
      if (!portfolio) throw new NotFoundException('Portfolio not found');

      let stocksValue = new Prisma.Decimal(0);
      for (const h of portfolio.holdings) {
        stocksValue = stocksValue.add(h.currentPrice.mul(new Prisma.Decimal(h.quantity.toString())));
      }

      const newNav = portfolio.cashBalance.add(stocksValue);

      const updated = await tx.recommendedPortfolio.update({
        where: { id: portfolioId },
        data: { currentNav: newNav },
      });

      // Use upsert-like logic for daily snapshots if desired, but for append-only history we just append
      // Or we can just create it. For safety in same-day recalculations, we can use a unique constraint or just create without unique date if we remove @@unique([portfolioId, date])
      // Wait, in schema it has @@unique([portfolioId, date]).
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      await tx.portfolioNavSnapshot.upsert({
        where: {
          portfolioId_date: {
            portfolioId,
            date: today
          }
        },
        update: {
          nav: newNav,
          cashBalance: portfolio.cashBalance,
        },
        create: {
          portfolioId,
          date: today,
          nav: newNav,
          cashBalance: portfolio.cashBalance,
        }
      });

      await this.redisService.getClient().set(
        `portfolio:nav:${portfolioId}`,
        newNav.toString(),
        'EX',
        86400
      );

      return updated;
    });
  }

  async getPortfolios(userId: number, userFeatures: string[]) {
    const portfolios = await this.prisma.recommendedPortfolio.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return portfolios.map(p => {
      const locked = !this.isTierAllowed(userFeatures, p.minTierAccess);
      return {
        ...p,
        initialCapital: p.initialCapital.toNumber(),
        currentNav: p.currentNav.toNumber(),
        cashBalance: p.cashBalance.toNumber(),
        locked,
      };
    });
  }

  async getPortfolioDetail(portfolioId: number, userId: number, userFeatures: string[]) {
    const portfolio = await this.prisma.recommendedPortfolio.findUnique({
      where: { id: portfolioId },
      include: {
        holdings: {
          include: {
            stock: true,
          }
        }
      }
    });

    if (!portfolio || portfolio.deletedAt) {
      throw new NotFoundException('Portfolio not found');
    }

    const locked = !this.isTierAllowed(userFeatures, portfolio.minTierAccess);

    const initialCapital = portfolio.initialCapital.toNumber();
    const currentNav = portfolio.currentNav.toNumber();
    const cashBalance = portfolio.cashBalance.toNumber();

    const holdings = portfolio.holdings.map(h => {
      const value = h.currentPrice.toNumber() * Number(h.quantity);
      const allocation = currentNav > 0 ? (value / currentNav) * 100 : 0;
      const profitLoss = (h.currentPrice.toNumber() - h.avgEntryPrice.toNumber()) * Number(h.quantity);
      const profitLossPercent = h.avgEntryPrice.toNumber() > 0 ? ((h.currentPrice.toNumber() - h.avgEntryPrice.toNumber()) / h.avgEntryPrice.toNumber()) * 100 : 0;

      return {
        id: h.id,
        stockId: h.stockId,
        symbol: h.stock.symbol,
        companyName: h.stock.companyName,
        quantity: Number(h.quantity),
        avgEntryPrice: h.avgEntryPrice.toNumber(),
        currentPrice: h.currentPrice.toNumber(),
        value,
        allocation,
        profitLoss,
        profitLossPercent,
      };
    });

    const cashAllocation = currentNav > 0 ? (cashBalance / currentNav) * 100 : 0;

    return {
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      status: portfolio.status,
      minTierAccess: portfolio.minTierAccess,
      initialCapital,
      currentNav,
      cashBalance,
      cashAllocation,
      locked,
      holdings: locked ? [] : holdings,
    };
  }

  private isTierAllowed(userFeatures: string[] | undefined, minTier: SUBSCRIPTION_TIER): boolean {
    return isFeatureAllowed(userFeatures, minTier);
  }
}
