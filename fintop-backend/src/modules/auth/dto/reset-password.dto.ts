import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token from the password reset email link' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ description: 'New password (min 6 chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
