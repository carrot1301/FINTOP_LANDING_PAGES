import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Market Data')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('sectors')
  @ApiOperation({ summary: 'List all market sectors' })
  @ApiResponse({ status: 200, description: 'List of sectors returned successfully' })
  async getSectors(@Query() pagination: PaginationDto) {
    return this.marketService.getSectors();
  }

  @Get('stocks/:symbol')
  @ApiOperation({ summary: 'Get stock details including realtime quote' })
  @ApiParam({ name: 'symbol', example: 'FPT' })
  async getStock(@Param('symbol') symbol: string) {
    return this.marketService.getStock(symbol.toUpperCase());
  }

  @Get('stocks/:symbol/historical')
  @ApiOperation({ summary: 'Get historical OHLCV data for charting' })
  @ApiParam({ name: 'symbol', example: 'FPT' })
  @ApiQuery({ name: 'startDate', type: String, required: true, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', type: String, required: true, example: '2026-05-18' })
  async getHistoricalData(
    @Param('symbol') symbol: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.marketService.getHistoricalOHLCV(
      symbol.toUpperCase(),
      new Date(startDate),
      new Date(endDate)
    );
  }
}
