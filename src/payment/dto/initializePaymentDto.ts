// dto/initialize-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  IsUrl,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

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
    description: 'URL to redirect to after payment',
    example: 'https://yourapp.com/payment/callback',
    type: String,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Callback URL must be a valid URL' })
  callback_url?: string;

  @ApiPropertyOptional({
    description: 'Additional data to attach to the transaction',
    example: {
      userId: '123',
      planName: 'Premium Monthly',
      orderId: 'ORD-001',
    }
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Invoice number for record keeping',
    example: 'INV-2024-001',
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Invoice number must be a string' })
  @MaxLength(100, { message: 'Invoice number cannot exceed 100 characters' })
  invoiceNumber?: string;
}
