import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsUUID,
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


}
