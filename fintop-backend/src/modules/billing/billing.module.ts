import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PaymentService } from './payment.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { NotificationModule } from '../notification/notification.module';
import { BillingController } from './billing.controller';

@Module({
  imports: [SubscriptionModule, NotificationModule],
  controllers: [BillingController],
  providers: [InvoiceService, PaymentService],
  exports: [InvoiceService, PaymentService],
})
export class BillingModule {}

