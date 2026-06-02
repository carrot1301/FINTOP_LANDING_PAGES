import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { INVOICE_STATUS, AUDIT_SOURCE } from '@prisma/client';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createSubscriptionInvoice(userId: number, planId: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'ACTIVE') throw new NotFoundException('Plan not found');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

    const invoice = await this.prisma.invoice.create({
      data: {
        userId,
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
