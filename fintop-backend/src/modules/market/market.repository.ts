import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { STOCK_STATUS } from '@prisma/client';

@Injectable()
export class MarketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStockBySymbol(symbol: string) {
    return this.prisma.stock.findUnique({
      where: { symbol },
      include: {
        exchange: true,
        industry: { include: { sector: true } },
      },
    });
  }

  async getStocks(params: {
    skip?: number;
    take?: number;
    exchangeId?: number;
    sectorId?: number;
    status?: STOCK_STATUS;
  }) {
    const { skip, take, exchangeId, sectorId, status } = params;
    return this.prisma.stock.findMany({
      skip,
      take,
      where: {
        status: status || STOCK_STATUS.ACTIVE,
        exchangeId,
        industry: sectorId ? { sectorId } : undefined,
        deletedAt: null,
      },
      include: {
        exchange: true,
        industry: { include: { sector: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getSectors() {
    return this.prisma.sector.findMany({
      include: { industries: true },
      orderBy: { name: 'asc' },
    });
  }

  async getHistoricalOHLCV(stockId: number, startDate: Date, endDate: Date) {
    return this.prisma.stockPriceDaily.findMany({
      where: {
        stockId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }
}
