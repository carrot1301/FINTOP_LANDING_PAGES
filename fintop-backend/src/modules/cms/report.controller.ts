import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('CMS Reports')
@Controller('cms/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List published reports for current user' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    const features = user?.planFeatures;
    return this.reportService.listReports(features, p, l);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download/track strategic VIP report' })
  async downloadReport(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.reportService.downloadReport(parseInt(id, 10), user.id, user.planFeatures);
  }
}
