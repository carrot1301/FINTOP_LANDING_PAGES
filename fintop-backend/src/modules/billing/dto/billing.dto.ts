import { IsNumber, IsInt, IsPositive, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BILLING_PROVIDER } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'ID of the subscription plan' })
  @IsInt()
  @IsPositive()
  planId: number;
}

export class WebhookPayloadDto {
  @ApiProperty({ enum: BILLING_PROVIDER })
  @IsEnum(BILLING_PROVIDER)
  provider: BILLING_PROVIDER;

  @ApiProperty()
  @IsString()
  providerId: string;

  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsString()
  idempotencyKey: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  planId: number;

  @ApiProperty()
  @IsNumber()
  timestamp: number;
}
