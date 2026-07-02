import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLE_CODE } from '@prisma/client';

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

  @Get('stocks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active stocks with basic metadata and quotes' })
  async getStocks() {
    return this.marketService.listActiveStocks();
  }

  @Get('stocks/lookup/:symbol')
  @ApiOperation({ summary: 'Look up stock exchange and industry from third-party API' })
  @ApiParam({ name: 'symbol', example: 'FPT' })
  async lookupStock(@Param('symbol') symbol: string) {
    return this.marketService.lookupStockMetadata(symbol);
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

  @Post('stocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Create a new stock (Admin only)' })
  async createStock(@Body() dto: any) {
    return this.marketService.createStock(dto);
  }

  @Put('stocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Update stock analyst data (Admin only)' })
  async updateStock(@Param('id') id: string, @Body() dto: any) {
    return this.marketService.updateStock(parseInt(id, 10), dto);
  }

  @Delete('stocks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Delete a stock (Admin only)' })
  async deleteStock(@Param('id') id: string) {
    return this.marketService.deleteStock(parseInt(id, 10));
  }

  @Post('stocks/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Bulk update stock orders or analysis data (Admin only)' })
  async bulkUpdateStocks(@Body() dto: { stocks: any[] }) {
    return this.marketService.bulkUpdateStocks(dto);
  }
}
