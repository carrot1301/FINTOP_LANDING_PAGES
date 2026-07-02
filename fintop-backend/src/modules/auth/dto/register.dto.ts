import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  investmentDuration?: string;

  @IsString()
  @IsOptional()
  investmentStyle?: string;

  @IsString()
  @IsOptional()
  stockCompany?: string;

  @IsString()
  @IsOptional()
  stockAccount?: string;

  @IsString()
  @IsOptional()
  referralId?: string;

  @IsString()
  @IsOptional()
  referralName?: string;
}
