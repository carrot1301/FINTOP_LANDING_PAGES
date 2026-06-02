import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Portfolios')
@Controller('portfolios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'List all recommended portfolios' })
  async getPortfolios(@CurrentUser() user: any) {
    return this.portfolioService.getPortfolios(user.id, user.tierLevel);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a recommended portfolio' })
  async getPortfolioDetail(@CurrentUser() user: any, @Param('id') id: string) {
    return this.portfolioService.getPortfolioDetail(parseInt(id, 10), user.id, user.tierLevel);
  }
}
