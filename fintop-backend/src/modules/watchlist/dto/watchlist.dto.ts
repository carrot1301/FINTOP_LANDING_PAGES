import { IsString, IsInt, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWatchlistDto {
  @ApiProperty({ description: 'Name of the watchlist' })
  @IsString()
  name: string;
}

export class AddStockDto {
  @ApiProperty({ description: 'ID of the stock to add', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  stockId?: number;

  @ApiProperty({ description: 'Symbol of the stock to add', required: false })
  @IsOptional()
  @IsString()
  symbol?: string;
}
