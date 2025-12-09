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
} from 'class-validator';

// Enums for better type safety
export enum PaymentMethodType {
  BANK_TRANSFER = 'bank_transfer',
  PAYSTACK = 'card',
  FLUTTERWAVE = 'flutterwave',
  WALLET = 'wallet',
}

export enum ApprovalStatusType {
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  UNAPPROVED = 'UNAPPROVED',
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


  @ApiPropertyOptional({
    description: 'Payment reference number',
    example: 'REF-ABC123XYZ',
  })
  @IsString()
  @IsOptional()
  reference?: string;


  @ApiPropertyOptional({
    description: 'That is the paystack recipient code for this user',
    example: 'ly_skef3fjg3',
  })
  @IsString()
  @IsNotEmpty()
  recipientCode: string;

  @ApiPropertyOptional({
    description: 'if',
    example: 'ly_skef3fjg3',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

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
