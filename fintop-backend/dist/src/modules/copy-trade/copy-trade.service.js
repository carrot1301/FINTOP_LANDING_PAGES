"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CopyTradeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyTradeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let CopyTradeService = CopyTradeService_1 = class CopyTradeService {
    prisma;
    logger = new common_1.Logger(CopyTradeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listMasters(activeOnly = false) {
        return this.prisma.copyTradeMaster.findMany({
            where: activeOnly ? { status: client_1.RECORD_STATUS.ACTIVE } : undefined,
            orderBy: { id: 'asc' },
        });
    }
    async getMaster(id) {
        const master = await this.prisma.copyTradeMaster.findUnique({
            where: { id },
            include: { copiers: true },
        });
        if (!master)
            throw new common_1.NotFoundException(`Master Trader with ID ${id} not found`);
        return master;
    }
    async createMaster(dto) {
        if (!dto.name || !dto.strategy || dto.aum < 0) {
            throw new common_1.BadRequestException('Vui lòng điền đầy đủ Tên, Chiến lược và Vốn ủy thác (AUM)');
        }
        return this.prisma.copyTradeMaster.create({
            data: {
                name: dto.name,
                strategy: dto.strategy,
                aum: dto.aum,
                profit: dto.profit ?? 0,
                winRate: dto.winRate ?? 0,
                status: client_1.RECORD_STATUS.ACTIVE,
            },
        });
    }
    async updateMaster(id, dto) {
        const master = await this.prisma.copyTradeMaster.findUnique({ where: { id } });
        if (!master)
            throw new common_1.NotFoundException(`Master Trader with ID ${id} not found`);
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
    async deleteMaster(id) {
        const master = await this.prisma.copyTradeMaster.findUnique({ where: { id } });
        if (!master)
            throw new common_1.NotFoundException(`Master Trader with ID ${id} not found`);
        return this.prisma.copyTradeMaster.delete({
            where: { id },
        });
    }
    async listCopiers() {
        return this.prisma.copyTradeCopier.findMany({
            include: { master: { select: { name: true } } },
            orderBy: { id: 'asc' },
        });
    }
    async createCopier(dto) {
        if (!dto.name || !dto.masterId || dto.capital <= 0 || dto.multiplier <= 0) {
            throw new common_1.BadRequestException('Thông tin tài khoản sao chép không hợp lệ!');
        }
        const master = await this.prisma.copyTradeMaster.findUnique({ where: { id: dto.masterId } });
        if (!master)
            throw new common_1.NotFoundException(`Master Trader with ID ${dto.masterId} not found`);
        return this.prisma.$transaction(async (tx) => {
            const copier = await tx.copyTradeCopier.create({
                data: {
                    name: dto.name,
                    masterId: dto.masterId,
                    capital: dto.capital,
                    multiplier: dto.multiplier,
                    profit: 0,
                    status: client_1.RECORD_STATUS.ACTIVE,
                },
            });
            await tx.copyTradeMaster.update({
                where: { id: dto.masterId },
                data: { followers: { increment: 1 } },
            });
            return copier;
        });
    }
    async updateCopier(id, dto) {
        const copier = await this.prisma.copyTradeCopier.findUnique({ where: { id } });
        if (!copier)
            throw new common_1.NotFoundException(`Copier account with ID ${id} not found`);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.copyTradeCopier.update({
                where: { id },
                data: {
                    multiplier: dto.multiplier,
                    profit: dto.profit,
                    status: dto.status,
                },
            });
            if (dto.status && dto.status !== copier.status) {
                const adjustment = dto.status === client_1.RECORD_STATUS.ACTIVE ? 1 : -1;
                await tx.copyTradeMaster.update({
                    where: { id: copier.masterId },
                    data: { followers: { increment: adjustment } },
                });
            }
            return updated;
        });
    }
    async deleteCopier(id) {
        const copier = await this.prisma.copyTradeCopier.findUnique({ where: { id } });
        if (!copier)
            throw new common_1.NotFoundException(`Copier account with ID ${id} not found`);
        return this.prisma.$transaction(async (tx) => {
            await tx.copyTradeCopier.delete({ where: { id } });
            if (copier.status === client_1.RECORD_STATUS.ACTIVE) {
                await tx.copyTradeMaster.update({
                    where: { id: copier.masterId },
                    data: { followers: { decrement: 1 } },
                });
            }
            return { success: true };
        });
    }
    async listOrders() {
        return this.prisma.copyTradeOrder.findMany({
            include: { master: { select: { name: true } } },
            orderBy: { time: 'desc' },
        });
    }
    async createOrder(dto) {
        if (!dto.masterId || !dto.symbol || !dto.action || dto.price <= 0 || dto.quantity <= 0) {
            throw new common_1.BadRequestException('Thông tin lệnh sao chép không hợp lệ!');
        }
        const master = await this.prisma.copyTradeMaster.findUnique({ where: { id: dto.masterId } });
        if (!master)
            throw new common_1.NotFoundException(`Master Trader with ID ${dto.masterId} not found`);
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
    async deleteOrder(id) {
        const order = await this.prisma.copyTradeOrder.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        return this.prisma.copyTradeOrder.delete({
            where: { id },
        });
    }
};
exports.CopyTradeService = CopyTradeService;
exports.CopyTradeService = CopyTradeService = CopyTradeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CopyTradeService);
//# sourceMappingURL=copy-trade.service.js.map