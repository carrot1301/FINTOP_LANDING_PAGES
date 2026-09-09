import { BILLING_PROVIDER } from '@prisma/client';
export declare class CreateInvoiceDto {
    planId: number;
}
export declare class WebhookPayloadDto {
    provider: BILLING_PROVIDER;
    providerId: string;
    invoiceId: string;
    amount: number;
    idempotencyKey: string;
    planId: number;
    timestamp: number;
}
