import { IsInt, IsPositive, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ALERT_CONDITION } from '@prisma/client';

export class CreateAlertDto {
  @ApiProperty({ description: 'ID of the stock to alert on' })
  @IsInt()
  @IsPositive()
  stockId: number;

  @ApiProperty({ enum: ALERT_CONDITION })
  @IsEnum(ALERT_CONDITION)
  condition: ALERT_CONDITION;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  targetValue: number;
}
