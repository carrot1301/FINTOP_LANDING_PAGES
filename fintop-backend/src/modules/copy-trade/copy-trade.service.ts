import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { RECORD_STATUS, Prisma } from '@prisma/client';

@Injectable()
export class CopyTradeService {
  private readonly logger = new Logger(CopyTradeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // MASTER TRADERS
  // ─────────────────────────────────────────────────────────────

  async listMasters(activeOnly = false) {
    return this.prisma.copyTradeMaster.findMany({
      where: activeOnly ? { status: RECORD_STATUS.ACTIVE } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  async getMaster(id: number) {
    const master = await this.prisma.copyTradeMaster.findUnique({
      where: { id },
      include: { copiers: true },
    });
    if (!master) throw new NotFoundException(`Master Trader with ID ${id} not found`);
    return master;
  }

  async createMaster(dto: { name: string; strategy: string; aum: number; profit?: number; winRate?: number }) {
    if (!dto.name || !dto.strategy || dto.aum < 0) {
      throw new BadRequestException('Vui lòng điền đầy đủ Tên, Chiến lược và Vốn ủy thác (AUM)');
    }
    return this.prisma.copyTradeMaster.create({
      data: {
        name: dto.name,
        strategy: dto.strategy,
        aum: dto.aum,
        profit: dto.profit ?? 0,
        winRate: dto.winRate ?? 0,
        status: RECORD_STATUS.ACTIVE,
      },
    });
  }

  async updateMaster(
    id: number,
    dto: { name?: string; strategy?: string; aum?: number; profit?: number; winRate?: number; status?: RECORD_STATUS },
  ) {
    const master = await this.prisma.copyTradeMaster.findUnique({ where: { id } });
    if (!master) throw new NotFoundException(`Master Trader with ID ${id} not found`);

    return this.prisma.copyTradeMaster.update({
      where: { id },
      data: {
        name: dto.name,
        strategy: dto.strategy,
        aum: dto.aum,
        profit: dto.profit,
        winRate: dto.winRate,
        status: dto.status,
      },
    });
  }

  async deleteMaster(id: number) {
    const master = await this.prisma.copyTradeMaster.findUnique({ where: { id } });
    if (!master) throw new NotFoundException(`Master Trader with ID ${id} not found`);

    return this.prisma.copyTradeMaster.delete({
      where: { id },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // COPIERS
  // ─────────────────────────────────────────────────────────────

  async listCopiers() {
    return this.prisma.copyTradeCopier.findMany({
      include: { master: { select: { name: true } } },
      orderBy: { id: 'asc' },
    });
  }

  async createCopier(dto: { name: string; masterId: number; capital: number; multiplier: number }) {
    if (!dto.name || !dto.masterId || dto.capital <= 0 || dto.multiplier <= 0) {
      throw new BadRequestException('Thông tin tài khoản sao chép không hợp lệ!');
    }

    const master = await this.prisma.copyTradeMaster.findUnique({ where: { id: dto.masterId } });
    if (!master) throw new NotFoundException(`Master Trader with ID ${dto.masterId} not found`);

    return this.prisma.$transaction(async (tx) => {
      const copier = await tx.copyTradeCopier.create({
        data: {
          name: dto.name,
          masterId: dto.masterId,
          capital: dto.capital,
          multiplier: dto.multiplier,
          profit: 0,
          status: RECORD_STATUS.ACTIVE,
        },
      });

      // Increment master's followers count
      await tx.copyTradeMaster.update({
        where: { id: dto.masterId },
        data: { followers: { increment: 1 } },
      });

      return copier;
    });
  }

  async updateCopier(id: number, dto: { multiplier?: number; profit?: number; status?: RECORD_STATUS }) {
    const copier = await this.prisma.copyTradeCopier.findUnique({ where: { id } });
    if (!copier) throw new NotFoundException(`Copier account with ID ${id} not found`);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.copyTradeCopier.update({
        where: { id },
        data: {
          multiplier: dto.multiplier,
          profit: dto.profit,
          status: dto.status,
        },
      });

      // If status changed, update followers count
      if (dto.status && dto.status !== copier.status) {
        const adjustment = dto.status === RECORD_STATUS.ACTIVE ? 1 : -1;
        await tx.copyTradeMaster.update({
          where: { id: copier.masterId },
          data: { followers: { increment: adjustment } },
        });
      }

      return updated;
    });
  }

  async deleteCopier(id: number) {
    const copier = await this.prisma.copyTradeCopier.findUnique({ where: { id } });
    if (!copier) throw new NotFoundException(`Copier account with ID ${id} not found`);

    return this.prisma.$transaction(async (tx) => {
      await tx.copyTradeCopier.delete({ where: { id } });

      if (copier.status === RECORD_STATUS.ACTIVE) {
        await tx.copyTradeMaster.update({
          where: { id: copier.masterId },
          data: { followers: { decrement: 1 } },
        });
      }

      return { success: true };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE ORDERS
  // ─────────────────────────────────────────────────────────────

  async listOrders() {
    return this.prisma.copyTradeOrder.findMany({
      include: { master: { select: { name: true } } },
      orderBy: { time: 'desc' },
    });
  }

  async createOrder(dto: { masterId: number; symbol: string; action: string; price: number; quantity: number; accounts: number; status?: string; successRate?: number }) {
    if (!dto.masterId || !dto.symbol || !dto.action || dto.price <= 0 || dto.quantity <= 0) {
      throw new BadRequestException('Thông tin lệnh sao chép không hợp lệ!');
    }

    const master = await this.prisma.copyTradeMaster.findUnique({ where: { id: dto.masterId } });
    if (!master) throw new NotFoundException(`Master Trader with ID ${dto.masterId} not found`);

    return this.prisma.copyTradeOrder.create({
      data: {
        masterId: dto.masterId,
        symbol: dto.symbol.toUpperCase(),
        action: dto.action.toUpperCase(),
        price: dto.price,
        quantity: dto.quantity,
        accounts: dto.accounts,
        status: dto.status ?? 'SUCCESS',
        successRate: dto.successRate ?? 100,
        time: new Date(),
      },
    });
  }

  async deleteOrder(id: number) {
    const order = await this.prisma.copyTradeOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    return this.prisma.copyTradeOrder.delete({
      where: { id },
    });
  }
}
