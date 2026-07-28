import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationService } from '../notification/notification.service';
import { INVOICE_STATUS, AUDIT_SOURCE } from '@prisma/client';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async createSubscriptionInvoice(userId: number, planId: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'ACTIVE') throw new NotFoundException('Plan not found');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

    const invoice = await this.prisma.invoice.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        currency: plan.currency,
        status: INVOICE_STATUS.DRAFT,
        dueDate,
      }
    });

    await this.auditService.log({
      userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'INVOICE_CREATED',
      tableName: 'invoices',
      recordId: invoice.id.toString(),
      newValues: { amount: plan.price, planId, status: INVOICE_STATUS.DRAFT }
    });

    // Notify admin users about new subscription request
    try {
      const adminUsers = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
          userRoles: {
            some: {
              role: {
                code: { in: ['SUPER_ADMIN', 'CEO', 'SALE_ADMIN', 'EDITOR_ADMIN'] as any }
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
        await this.notificationService.createNotification(
          admin.id,
          `Yêu cầu phê duyệt gói ${plan.tierLevel}`,
          `Người dùng ${userDisplayName}${stockInfo} vừa gửi yêu cầu phê duyệt cho gói ${plan.name} (Mã HĐ: #${invoice.id}).`
        );
      }
    } catch (notifErr: any) {
      this.logger.warn(`Could not notify admins on invoice creation: ${notifErr.message}`);
    }

    return { invoice, plan };
  }

  async markInvoiceOpen(invoiceId: bigint) {
    const invoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: INVOICE_STATUS.OPEN },
    });

    await this.auditService.log({
      userId: invoice.userId,
      source: AUDIT_SOURCE.SYSTEM,
      action: 'INVOICE_OPENED',
      tableName: 'invoices',
      recordId: invoice.id.toString(),
    });

    return invoice;
  }
}

