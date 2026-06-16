import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { MarketService } from '../market/market.service';
import { MarketIntelligenceService } from '../market/market-intelligence.service';
import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class ResearchDataAggregatorService {
  private readonly logger = new Logger(ResearchDataAggregatorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketService: MarketService,
    private readonly intelligenceService: MarketIntelligenceService,
    private readonly portfolioService: PortfolioService,
  ) {}

  async aggregate(reportType: string, subject: string, dateRange?: { start_date: string; end_date: string }) {
    this.logger.log(`Aggregating data for report: ${reportType} - subject: ${subject}`);
    const warnings: string[] = [];
    const dataSources: string[] = ['Prisma Database', 'Redis Cache'];

    let financials: any = { status: 'Not applicable' };
    let quant: any = { status: 'Not applicable' };
    let backtest: any = { status: 'Data unavailable' };
    let optimizer: any = { status: 'Data unavailable' };
    let marketIntelligence: any = { status: 'Not applicable' };

    // Register unavailable engine warnings
    warnings.push('Backtest Engine data is unavailable in this workspace.');
    warnings.push('Optimizer Engine data is unavailable in this workspace.');

    // 1. Company Report Data
    if (reportType === 'company') {
      dataSources.push('VNDIRECT Stock metadata API');
      try {
        const stock = await this.prisma.stock.findUnique({
          where: { symbol: subject.toUpperCase().trim() },
          include: {
            exchange: true,
            industry: {
              include: { sector: true }
            }
          }
        });

        if (!stock) {
          warnings.push(`Stock symbol ${subject} not found in database.`);
        } else {
          // Get latest price close
          const latestPrice = await this.prisma.stockPriceDaily.findFirst({
            where: { stockId: stock.id },
            orderBy: { date: 'desc' },
            select: { close: true, open: true, high: true, low: true, volume: true, date: true }
          });

          // Get latest financial indicators (P/E, P/B, EPS, MarketCap)
          const latestFin = await this.prisma.financialIndicator.findFirst({
            where: { stockId: stock.id },
            orderBy: { date: 'desc' }
          });

          financials = {
            ticker: stock.symbol,
            companyName: stock.companyName,
            exchange: stock.exchange.code,
            sector: stock.industry?.sector?.name || 'Đa ngành',
            industry: stock.industry?.name || 'Đa ngành',
            priceClose: latestPrice ? Number(latestPrice.close) : null,
            priceDate: latestPrice ? latestPrice.date.toISOString().split('T')[0] : null,
            peRatio: latestFin ? Number(latestFin.peRatio) : null,
            pbRatio: latestFin ? Number(latestFin.pbRatio) : null,
            eps: latestFin ? Number(latestFin.eps) : null,
            marketCap: latestFin ? Number(latestFin.marketCap) : null,
          };

          quant = {
            ratingTA: stock.rsi_mfi || 'ĐI NGANG',
            trend: stock.identify_trend || 'Chưa xác định',
            actSignal: stock.act || 'TRUNG LẬP',
            resistance: stock.resistance_range || 'Không rõ',
            support: stock.support_range || 'Không rõ',
            analyst: stock.analyst || 'FinTop DATA',
          };
        }
      } catch (err) {
        this.logger.error(`Error aggregating company data: ${err.message}`);
        warnings.push(`Failed to aggregate company data: ${err.message}`);
      }
    }

    // 2. Sector Report Data
    if (reportType === 'sector') {
      dataSources.push('Sector Rotation Engine');
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const sectors = await this.intelligenceService.getSectorRotation('1M', 10, todayStr);
        const sectorData = sectors.find(s => s.sectorName === subject || s.sectorCode === subject);

        if (!sectorData) {
          warnings.push(`Sector ${subject} not found in database history.`);
        } else {
          marketIntelligence = {
            sectorCode: sectorData.sectorCode,
            sectorName: sectorData.sectorName,
            return1d: Number(sectorData.return1d),
            return1w: Number(sectorData.return1w),
            return1m: Number(sectorData.return1m),
            return3m: Number(sectorData.return3m),
            relativeStrength: Number(sectorData.relativeStrength),
            rank1m: sectorData.rank1m,
            rank3m: sectorData.rank3m,
          };
        }
      } catch (err) {
        this.logger.error(`Error aggregating sector data: ${err.message}`);
        warnings.push(`Failed to aggregate sector data: ${err.message}`);
      }
    }

    // 3. Weekly Market Report / Market Brief Data
    if (reportType === 'weekly_market' || reportType === 'market_brief') {
      dataSources.push('Market Intelligence Center');
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const summary = await this.intelligenceService.getSummary(todayStr);

        marketIntelligence = {
          tradeDate: summary.trade_date,
          regime: summary.market_regime,
          breadth: summary.market_breadth,
          sectors: summary.sector_rotation,
          moneyFlow: summary.money_flow,
          foreignFlow: summary.foreign_flow,
        };
      } catch (err) {
        this.logger.error(`Error aggregating market data: ${err.message}`);
        warnings.push(`Failed to aggregate market data: ${err.message}`);
      }
    }

    // 4. Portfolio Report Data
    if (reportType === 'portfolio') {
      dataSources.push('Portfolio Management Module');
      try {
        // Attempt to find portfolio by ID or subject name
        let portfolioId = parseInt(subject, 10);
        if (isNaN(portfolioId)) {
          const firstPort = await this.prisma.recommendedPortfolio.findFirst({
            where: { name: { contains: subject } }
          });
          portfolioId = firstPort ? firstPort.id : -1;
        }

        const detail = portfolioId !== -1 
          ? await this.portfolioService.getPortfolioDetail(portfolioId, 1, 'DIAMOND') // use high tier to fetch detail
          : null;

        if (!detail) {
          warnings.push(`Portfolio ${subject} not found.`);
        } else {
          const cash = Number(detail.cashBalance || 0);
          const holdings = detail.holdings || [];
          let stocksValue = 0;
          holdings.forEach(h => {
            stocksValue += Number(h.currentPrice) * Number(h.quantity);
          });
          const totalNav = cash + stocksValue;

          quant = {
            portfolioId: detail.id,
            name: detail.name,
            description: detail.description,
            initialCapital: Number(detail.initialCapital),
            currentNav: totalNav,
            cashBalance: cash,
            stocksValue,
            holdings: holdings.map(h => ({
              symbol: h.symbol,
              quantity: Number(h.quantity),
              avgEntryPrice: Number(h.avgEntryPrice),
              currentPrice: Number(h.currentPrice),
              value: Number(h.currentPrice) * Number(h.quantity),
              allocation: totalNav > 0 ? ((Number(h.currentPrice) * Number(h.quantity)) / totalNav * 100) : 0
            }))
          };
        }
      } catch (err) {
        this.logger.error(`Error aggregating portfolio data: ${err.message}`);
        warnings.push(`Failed to aggregate portfolio data: ${err.message}`);
      }
    }

    return {
      report_type: reportType,
      subject,
      data_sources: dataSources,
      financials,
      quant,
      backtest,
      optimizer,
      market_intelligence: marketIntelligence,
      warnings
    };
  }
}
