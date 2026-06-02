import { IsString, IsInt, IsPositive, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONTENT_VISIBILITY, SUBSCRIPTION_TIER, BLOG_STATUS } from '@prisma/client';

export class CreateBlogDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: CONTENT_VISIBILITY, required: false })
  @IsOptional()
  @IsEnum(CONTENT_VISIBILITY)
  visibility?: CONTENT_VISIBILITY;

  @ApiProperty({ enum: SUBSCRIPTION_TIER, required: false })
  @IsOptional()
  @IsEnum(SUBSCRIPTION_TIER)
  minTierAccess?: SUBSCRIPTION_TIER;
}

export class UpdateBlogStatusDto {
  @ApiProperty({ enum: BLOG_STATUS })
  @IsEnum(BLOG_STATUS)
  status: BLOG_STATUS;
}
