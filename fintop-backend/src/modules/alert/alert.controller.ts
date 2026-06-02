import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateAlertDto } from './dto/alert.dto';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active alerts for current user' })
  async getAlerts(@CurrentUser() user: any) {
    return this.alertService.getUserAlerts(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiBody({ type: CreateAlertDto })
  async createAlert(@CurrentUser() user: any, @Body() dto: CreateAlertDto) {
    return this.alertService.createAlert(user.id, dto.stockId, dto.condition, dto.targetValue);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific alert' })
  async deleteAlert(@CurrentUser() user: any, @Param('id') id: string) {
    return this.alertService.deleteAlert(user.id, parseInt(id, 10));
  }
}
