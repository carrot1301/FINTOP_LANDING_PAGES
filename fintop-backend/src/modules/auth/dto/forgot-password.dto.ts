import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@fintopdata.vn' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
