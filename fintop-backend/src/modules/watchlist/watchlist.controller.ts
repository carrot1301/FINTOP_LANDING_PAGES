import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateWatchlistDto, AddStockDto } from './dto/watchlist.dto';

@ApiTags('Watchlists')
@Controller('watchlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all watchlists for current user' })
  async getUserWatchlists(@CurrentUser() user: any) {
    return this.watchlistService.getUserWatchlists(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new watchlist' })
  @ApiBody({ type: CreateWatchlistDto })
  async createWatchlist(@CurrentUser() user: any, @Body() dto: CreateWatchlistDto) {
    return this.watchlistService.createWatchlist(user.id, dto.name);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add a stock to a watchlist' })
  @ApiBody({ type: AddStockDto })
  async addItem(@CurrentUser() user: any, @Param('id') watchlistId: string, @Body() dto: AddStockDto) {
    return this.watchlistService.addStockToWatchlist(user.id, parseInt(watchlistId, 10), dto.stockId, dto.symbol);
  }

  @Delete(':id/items/:symbol')
  @ApiOperation({ summary: 'Remove a stock from a watchlist by symbol' })
  async removeItem(@CurrentUser() user: any, @Param('id') watchlistId: string, @Param('symbol') symbol: string) {
    return this.watchlistService.removeStockFromWatchlist(user.id, parseInt(watchlistId, 10), symbol);
  }
}
