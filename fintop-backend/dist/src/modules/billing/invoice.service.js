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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const audit_service_1 = require("../../common/audit/audit.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    prisma;
    auditService;
    notificationService;
    logger = new common_1.Logger(InvoiceService_1.name);
    constructor(prisma, auditService, notificationService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async createSubscriptionInvoice(userId, planId) {
        const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan || plan.status !== 'ACTIVE')
            throw new common_1.NotFoundException('Plan not found');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const invoice = await this.prisma.invoice.create({
            data: {
                userId,
                planId,
                amount: plan.price,
                currency: plan.currency,
                status: client_1.INVOICE_STATUS.DRAFT,
                dueDate,
            }
        });
        await this.auditService.log({
            userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'INVOICE_CREATED',
            tableName: 'invoices',
            recordId: invoice.id.toString(),
            newValues: { amount: plan.price, planId, status: client_1.INVOICE_STATUS.DRAFT }
        });
        try {
            const adminUsers = await this.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    userRoles: {
                        some: {
                            role: {
                                code: { in: ['SUPER_ADMIN', 'CEO', 'SALE_ADMIN', 'EDITOR_ADMIN'] }
                            }
                        }
                    }
                },
                select: { id: true }
            });
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { fullName: true, email: true, phone: true, stockAccount: true, stockCompany: true }
            });
            const userDisplayName = user?.fullName || user?.email || `User #${userId}`;
            const stockInfo = (user?.stockAccount && user?.stockCompany) ? ` (Số TKCK: ${user.stockAccount} - ${user.stockCompany})` : '';
            for (const admin of adminUsers) {
                await this.notificationService.createNotification(admin.id, `Yêu cầu phê duyệt gói ${plan.tierLevel}`, `Người dùng ${userDisplayName}${stockInfo} vừa gửi yêu cầu phê duyệt cho gói ${plan.name} (Mã HĐ: #${invoice.id}).`);
            }
        }
        catch (notifErr) {
            this.logger.warn(`Could not notify admins on invoice creation: ${notifErr.message}`);
        }
        return { invoice, plan };
    }
    async markInvoiceOpen(invoiceId) {
        const invoice = await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: client_1.INVOICE_STATUS.OPEN },
        });
        await this.auditService.log({
            userId: invoice.userId,
            source: client_1.AUDIT_SOURCE.SYSTEM,
            action: 'INVOICE_OPENED',
            tableName: 'invoices',
            recordId: invoice.id.toString(),
        });
        return invoice;
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notification_service_1.NotificationService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map