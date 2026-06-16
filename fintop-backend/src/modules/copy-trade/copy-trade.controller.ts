import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CopyTradeService } from './copy-trade.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ROLE_CODE, RECORD_STATUS } from '@prisma/client';

@ApiTags('Copy Trade')
@Controller('copy-trade')
export class CopyTradeController {
  constructor(private readonly copyTradeService: CopyTradeService) {}

  // ─────────────────────────────────────────────────────────────
  // MASTER TRADERS (Public read, admin write)
  // ─────────────────────────────────────────────────────────────

  @Get('masters')
  @ApiOperation({ summary: 'Get list of active or all Master Traders' })
  async getMasters(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly === 'true';
    return this.copyTradeService.listMasters(active);
  }

  @Get('masters/:id')
  @ApiOperation({ summary: 'Get details of a specific Master Trader' })
  async getMaster(@Param('id') id: string) {
    return this.copyTradeService.getMaster(parseInt(id, 10));
  }

  @Post('masters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Create a new Master Trader (Admin only)' })
  async createMaster(@Body() dto: { name: string; strategy: string; aum: number; profit?: number; winRate?: number }) {
    return this.copyTradeService.createMaster({
      name: dto.name,
      strategy: dto.strategy,
      aum: Number(dto.aum),
      profit: dto.profit ? Number(dto.profit) : undefined,
      winRate: dto.winRate ? Number(dto.winRate) : undefined,
    });
  }

  @Put('masters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Update a Master Trader configuration (Admin only)' })
  async updateMaster(
    @Param('id') id: string,
    @Body() dto: { name?: string; strategy?: string; aum?: number; profit?: number; winRate?: number; status?: RECORD_STATUS },
  ) {
    return this.copyTradeService.updateMaster(parseInt(id, 10), {
      name: dto.name,
      strategy: dto.strategy,
      aum: dto.aum !== undefined ? Number(dto.aum) : undefined,
      profit: dto.profit !== undefined ? Number(dto.profit) : undefined,
      winRate: dto.winRate !== undefined ? Number(dto.winRate) : undefined,
      status: dto.status,
    });
  }

  @Delete('masters/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Delete a Master Trader (Admin only)' })
  async deleteMaster(@Param('id') id: string) {
    return this.copyTradeService.deleteMaster(parseInt(id, 10));
  }

  // ─────────────────────────────────────────────────────────────
  // COPIERS (Admin only)
  // ─────────────────────────────────────────────────────────────

  @Get('copiers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'List all Copiers (Admin only)' })
  async getCopiers() {
    return this.copyTradeService.listCopiers();
  }

  @Post('copiers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Create or link a Copier account (Admin only)' })
  async createCopier(@Body() dto: { name: string; masterId: number; capital: number; multiplier: number }) {
    return this.copyTradeService.createCopier({
      name: dto.name,
      masterId: parseInt(dto.masterId as any, 10),
      capital: Number(dto.capital),
      multiplier: Number(dto.multiplier),
    });
  }

  @Put('copiers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Update a Copier account status or multiplier (Admin only)' })
  async updateCopier(
    @Param('id') id: string,
    @Body() dto: { multiplier?: number; profit?: number; status?: RECORD_STATUS },
  ) {
    return this.copyTradeService.updateCopier(parseInt(id, 10), {
      multiplier: dto.multiplier !== undefined ? Number(dto.multiplier) : undefined,
      profit: dto.profit !== undefined ? Number(dto.profit) : undefined,
      status: dto.status,
    });
  }

  @Delete('copiers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Delete/Unlink a Copier account (Admin only)' })
  async deleteCopier(@Param('id') id: string) {
    return this.copyTradeService.deleteCopier(parseInt(id, 10));
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE ORDERS (Public read, admin write)
  // ─────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'Get list of live copy trading order logs' })
  async getOrders() {
    return this.copyTradeService.listOrders();
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Post a new copy trade order log (Admin only)' })
  async createOrder(
    @Body()
    dto: {
      masterId: number;
      symbol: string;
      action: string;
      price: number;
      quantity: number;
      accounts: number;
      status?: string;
      successRate?: number;
    },
  ) {
    return this.copyTradeService.createOrder({
      masterId: parseInt(dto.masterId as any, 10),
      symbol: dto.symbol,
      action: dto.action,
      price: Number(dto.price),
      quantity: Number(dto.quantity),
      accounts: parseInt(dto.accounts as any, 10),
      status: dto.status,
      successRate: dto.successRate !== undefined ? Number(dto.successRate) : undefined,
    });
  }

  @Delete('orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(ROLE_CODE.SUPER_ADMIN, ROLE_CODE.CEO, ROLE_CODE.ASSISTANT_CEO, ROLE_CODE.EDITOR_ADMIN)
  @ApiOperation({ summary: 'Delete a copy order log (Admin only)' })
  async deleteOrder(@Param('id') id: string) {
    return this.copyTradeService.deleteOrder(parseInt(id, 10));
  }
}
