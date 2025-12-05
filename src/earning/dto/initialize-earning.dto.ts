// dto/initialize-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class InitializeEarningDto {
  @ApiProperty({
    description:
      'Amount in kobo (smallest currency unit). For NGN, 10000 = ₦100',
    example: 50000,
    minimum: 100,
    type: Number,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(100, { message: 'Amount must be at least 100 kobo (₦1)' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Unique transaction reference. Auto-generated if not provided',
    example: 'BNT-A3F7B2C9',
    maxLength: 200,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Reference must be a string' })
  @MaxLength(200, { message: 'Reference cannot exceed 200 characters' })
  reference?: string;

  @ApiPropertyOptional({
    description: 'This is the reason for the transfer',
    example: 'Earning for campaign Big Cola Africa',
    maxLength: 200,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Reference must be a string' })
  @MaxLength(200, { message: 'Reference cannot exceed 200 characters' })
  reason?: string;


  @ApiPropertyOptional({
    description: 'This is the reason for the transfer',
    example: 'Earning for campaign Big Cola Africa',
    maxLength: 200,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Reference must be a string' })
  @MaxLength(200, { message: 'Reference cannot exceed 200 characters' })
  recipient?: string;
}
