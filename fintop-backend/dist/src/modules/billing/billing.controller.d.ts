import { InvoiceService } from './invoice.service';
import { PaymentService } from './payment.service';
import { CreateInvoiceDto, WebhookPayloadDto } from './dto/billing.dto';
export declare class BillingController {
    private readonly invoiceService;
    private readonly paymentService;
    constructor(invoiceService: InvoiceService, paymentService: PaymentService);
    getInvoices(user: any): Promise<never[]>;
    createInvoice(user: any, dto: CreateInvoiceDto): Promise<{
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
    handleWebhook(payload: WebhookPayloadDto, signature: string): Promise<{
        message: string;
        success?: undefined;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
