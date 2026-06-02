import { IsInt, IsPositive, IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SIGNAL_DIRECTION, SUBSCRIPTION_TIER, SIGNAL_STATUS } from '@prisma/client';

export class CreateSignalDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  stockId: number;

  @ApiProperty({ enum: SIGNAL_DIRECTION })
  @IsEnum(SIGNAL_DIRECTION)
  direction: SIGNAL_DIRECTION;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  entryPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  cutLossPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  targetPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: SUBSCRIPTION_TIER, required: false })
  @IsOptional()
  @IsEnum(SUBSCRIPTION_TIER)
  minTierAccess?: SUBSCRIPTION_TIER;
}

export class UpdateSignalStatusDto {
  @ApiProperty({ enum: SIGNAL_STATUS })
  @IsEnum(SIGNAL_STATUS)
  status: SIGNAL_STATUS;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  triggerPrice: number;
}
