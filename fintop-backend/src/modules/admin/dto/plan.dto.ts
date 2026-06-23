import { IsString, IsOptional, IsEnum, IsInt, IsPositive, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SUBSCRIPTION_TIER, RECORD_STATUS } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name (e.g. STANDARD, SILVER, GOLD, DIAMOND)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SUBSCRIPTION_TIER, description: 'Tier level' })
  @IsEnum(SUBSCRIPTION_TIER)
  tierLevel: SUBSCRIPTION_TIER;

  @ApiProperty({ description: 'Price in VND' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Duration in days' })
  @IsInt()
  @IsPositive()
  durationDays: number;

  @ApiPropertyOptional({ description: 'Features separated by semicolons' })
  @IsOptional()
  @IsString()
  features?: string;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: SUBSCRIPTION_TIER, description: 'Tier level' })
  @IsOptional()
  @IsEnum(SUBSCRIPTION_TIER)
  tierLevel?: SUBSCRIPTION_TIER;

  @ApiPropertyOptional({ description: 'Price in VND' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Duration in days' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Features separated by semicolons' })
  @IsOptional()
  @IsString()
  features?: string;

  @ApiPropertyOptional({ enum: RECORD_STATUS, description: 'Plan status' })
  @IsOptional()
  @IsEnum(RECORD_STATUS)
  status?: RECORD_STATUS;
}
