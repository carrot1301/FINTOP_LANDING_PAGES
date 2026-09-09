import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotificationService } from '../notification/notification.service';
export declare class InvoiceService {
    private readonly prisma;
    private readonly auditService;
    private readonly notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService, notificationService: NotificationService);
    createSubscriptionInvoice(userId: number, planId: number): Promise<{
        invoice: {
            status: import("@prisma/client").$Enums.INVOICE_STATUS;
            id: bigint;
            createdAt: Date;
            userId: number;
            updatedAt: Date;
            deletedAt: Date | null;
            planId: number | null;
            currency: string;
            subscriptionId: bigint | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            dueDate: Date;
        };
        plan: {
            name: string;
            description: string | null;
            status: import("@prisma/client").$Enums.RECORD_STATUS;
            id: number;
            createdAt: Date;
            tierLevel: import("@prisma/client").$Enums.SUBSCRIPTION_TIER;
            updatedAt: Date;
            deletedAt: Date | null;
            features: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            durationDays: number;
        };
    }>;
    markInvoiceOpen(invoiceId: bigint): Promise<{
        status: import("@prisma/client").$Enums.INVOICE_STATUS;
        id: bigint;
        createdAt: Date;
        userId: number;
        updatedAt: Date;
        deletedAt: Date | null;
        planId: number | null;
        currency: string;
        subscriptionId: bigint | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        dueDate: Date;
    }>;
}
