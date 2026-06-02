import { Controller, Get, Post, Body, UseGuards, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiBody } from '@nestjs/swagger';
import { CreateInvoiceDto, WebhookPayloadDto } from './dto/billing.dto';

@ApiTags('Billing & Payments')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invoices for current user' })
  async getInvoices(@CurrentUser() user: any) {
    // In a real implementation this would fetch from DB
    return []; 
  }

  @Post('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invoice for subscription checkout' })
  async createInvoice(@CurrentUser() user: any, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.createSubscriptionInvoice(user.id, dto.planId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle incoming payment gateway webhook' })
  @ApiHeader({ name: 'x-webhook-signature' })
  async handleWebhook(@Body() payload: WebhookPayloadDto, @Headers('x-webhook-signature') signature: string) {
    if (!signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }
    
    // Verify signature
    this.paymentService.verifyWebhookSignature(payload, signature);
    
    // Process payment success event securely
    return this.paymentService.processWebhookPayment(
      payload.provider,
      payload.providerId,
      BigInt(payload.invoiceId),
      payload.amount,
      payload.idempotencyKey,
      payload.planId
    );
  }
}
