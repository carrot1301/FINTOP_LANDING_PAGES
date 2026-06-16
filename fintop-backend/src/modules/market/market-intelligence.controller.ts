import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketDataProviderService } from './market-data-provider.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Market Intelligence')
@Controller('market')
export class MarketIntelligenceController {
  constructor(
    private readonly service: MarketIntelligenceService,
    private readonly provider: MarketDataProviderService,
  ) {}

  @Get('sector-rotation')
  @ApiOperation({ summary: 'Get ranked sector performance' })
  @ApiQuery({ name: 'period', required: false, example: '1M' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'trade_date', required: false })
  async getSectorRotation(
    @Query('period') period?: string,
    @Query('limit') limit?: string,
    @Query('trade_date') tradeDate?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.service.getSectorRotation(period || '1M', lim, tradeDate);
  }

  @Get('sector-rotation/history')
  @ApiOperation({ summary: 'Get historical sector performance' })
  @ApiQuery({ name: 'sector_code', required: true, example: 'CNTT' })
  @ApiQuery({ name: 'start_date', required: true, example: '2026-01-01' })
  @ApiQuery({ name: 'end_date', required: true, example: '2026-06-01' })
  async getSectorRotationHistory(
    @Query('sector_code') sectorCode: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.service.getSectorRotationHistory(sectorCode, startDate, endDate);
  }

  @Get('money-flow')
  @ApiOperation({ summary: 'Get money flow tracker' })
  @ApiQuery({ name: 'trade_date', required: false })
  @ApiQuery({ name: 'group_by', required: false, example: 'sector' })
  async getMoneyFlow(
    @Query('trade_date') tradeDate?: string,
    @Query('group_by') groupBy?: string,
  ) {
    return this.service.getMoneyFlow(tradeDate || new Date().toISOString(), groupBy || 'sector');
  }

  @Get('money-flow/history')
  @ApiOperation({ summary: 'Get money flow history' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'group_by', required: false, example: 'sector' })
  async getMoneyFlowHistory(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('group_by') groupBy?: string,
  ) {
    return this.service.getMoneyFlowHistory(startDate, endDate, groupBy || 'sector');
  }

  @Get('foreign-flow')
  @ApiOperation({ summary: 'Get foreign flow monitor' })
  @ApiQuery({ name: 'trade_date', required: false })
  @ApiQuery({ name: 'group_by', required: false, example: 'sector' })
  async getForeignFlow(
    @Query('trade_date') tradeDate?: string,
    @Query('group_by') groupBy?: string,
  ) {
    return this.service.getForeignFlow(tradeDate || new Date().toISOString(), groupBy || 'sector');
  }

  @Get('foreign-flow/history')
  @ApiOperation({ summary: 'Get foreign flow history' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'group_by', required: false, example: 'sector' })
  async getForeignFlowHistory(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('group_by') groupBy?: string,
  ) {
    return this.service.getForeignFlowHistory(startDate, endDate, groupBy || 'sector');
  }

  @Get('breadth')
  @ApiOperation({ summary: 'Get market breadth counts' })
  @ApiQuery({ name: 'trade_date', required: false })
  @ApiQuery({ name: 'exchange', required: false, example: 'ALL' })
  async getMarketBreadth(
    @Query('trade_date') tradeDate?: string,
    @Query('exchange') exchange?: string,
  ) {
    return this.service.getMarketBreadth(tradeDate || new Date().toISOString(), exchange || 'ALL');
  }

  @Get('breadth/history')
  @ApiOperation({ summary: 'Get market breadth history' })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  @ApiQuery({ name: 'exchange', required: false, example: 'ALL' })
  async getMarketBreadthHistory(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('exchange') exchange?: string,
  ) {
    return this.service.getMarketBreadthHistory(startDate, endDate, exchange || 'ALL');
  }

  @Get('regime')
  @ApiOperation({ summary: 'Get market regime signal' })
  @ApiQuery({ name: 'index_code', required: false, example: 'VNINDEX' })
  @ApiQuery({ name: 'trade_date', required: false })
  async getMarketRegime(
    @Query('index_code') indexCode?: string,
    @Query('trade_date') tradeDate?: string,
  ) {
    return this.service.getMarketRegime(indexCode || 'VNINDEX', tradeDate);
  }

  @Get('regime/history')
  @ApiOperation({ summary: 'Get market regime history' })
  @ApiQuery({ name: 'index_code', required: true })
  @ApiQuery({ name: 'start_date', required: true })
  @ApiQuery({ name: 'end_date', required: true })
  async getMarketRegimeHistory(
    @Query('index_code') indexCode: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.service.getMarketRegimeHistory(indexCode, startDate, endDate);
  }

  @Get('intelligence/summary')
  @ApiOperation({ summary: 'Get all-in-one market intelligence summary for dashboard' })
  @ApiQuery({ name: 'trade_date', required: false })
  async getSummary(@Query('trade_date') tradeDate?: string) {
    return this.service.getSummary(tradeDate);
  }

  @Get('health')
  @ApiOperation({ summary: 'Monitor availability of market data systems' })
  async getHealth() {
    return this.provider.healthCheck();
  }

  @Post('intelligence/refresh')
  @ApiOperation({ summary: 'Manual refresh/upsert of market intelligence metrics' })
  @ApiQuery({ name: 'trade_date', required: false })
  async refreshData(@Query('trade_date') tradeDate?: string) {
    return this.service.refreshIntelligenceData(tradeDate);
  }

  @Get('intelligence/export')
  @ApiOperation({ summary: 'Export market intelligence report to JSON or CSV' })
  @ApiQuery({ name: 'format', required: false, example: 'json' })
  @ApiQuery({ name: 'trade_date', required: false })
  async exportData(
    @Query('format') format?: string,
    @Query('trade_date') tradeDate?: string,
    @Res() res?: Response,
  ) {
    const f = (format || 'json').toLowerCase();
    if (f === 'csv') {
      const csv = await this.service.exportCSV(tradeDate);
      res?.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res?.setHeader('Content-Disposition', `attachment; filename=market_intelligence_${tradeDate || 'report'}.csv`);
      res?.status(200).send(csv);
    } else {
      const summary = await this.service.getSummary(tradeDate);
      res?.setHeader('Content-Type', 'application/json; charset=utf-8');
      res?.status(200).json(summary);
    }
  }
}
