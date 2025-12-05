import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

// Enums for better type safety
export enum PaymentMethodType {
  BANK_TRANSFER = 'bank_transfer',
  PAYSTACK = 'card',
  FLUTTERWAVE = 'flutterwave',
  WALLET = 'wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Create DTO
export class CreateEarningDto {
  @ApiProperty({
    description: 'Campaign ID associated with the earning',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({
    description: 'Email of the user receiving the earning',
    example: 'driver@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Amount earned',
    example: 5000.5,
    minimum: 0,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Month of the earning (e.g., "2025-12", "December 2025")',
    example: '2025-12',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  month: string;

  @ApiPropertyOptional({
    description: 'Invoice ID for the transaction',
    example: 'INV-2025-001',
  })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({
    description: 'Payment reference number',
    example: 'REF-ABC123XYZ',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Date when payment was initiated',
    example: '2025-12-05T10:30:00Z',
  })
  @IsString()
  @IsOptional()
  dateInitiated?: string;

  @ApiProperty({
    description: 'Payment method used',
    example: PaymentMethodType.BANK_TRANSFER,
    enum: PaymentMethodType,
  })
  @IsEnum(PaymentMethodType)
  @IsNotEmpty()
  paymentMethod: PaymentMethodType;

  @ApiProperty({
    description: 'Current payment status',
    example: PaymentStatus.PENDING,
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  paymentStatus: PaymentStatus;
}


// export class GetEarningsQueryDto {
//   @ApiPropertyOptional({
//     description: 'Filter by campaign ID',
//     example: '550e8400-e29b-41d4-a716-446655440000',
//   })
//   @IsUUID()
//   @IsOptional()
//   campaignId?: string;

//   @ApiPropertyOptional({
//     description: 'Filter by email',
//     example: 'driver@example.com',
//   })
//   @IsEmail()
//   @IsOptional()
//   email?: string;

//   @ApiPropertyOptional({
//     description: 'Filter by payment status',
//     example: PaymentStatus.PAID,
//     enum: PaymentStatus,
//   })
//   @IsEnum(PaymentStatus)
//   @IsOptional()
//   paymentStatus?: PaymentStatus;

//   @ApiPropertyOptional({
//     description: 'Filter by month',
//     example: '2025-12',
//   })
//   @IsString()
//   @IsOptional()
//   month?: string;

//   @ApiPropertyOptional({
//     description: 'Page number',
//     example: 1,
//     minimum: 1,
//     default: 1,
//   })
//   @IsNumber()
//   @Min(1)
//   @IsOptional()
//   page?: number = 1;

//   @ApiPropertyOptional({
//     description: 'Items per page',
//     example: 10,
//     minimum: 1,
//     maximum: 100,
//     default: 10,
//   })
//   @IsNumber()
//   @Min(1)
//   @IsOptional()
//   limit?: number = 10;
// }
