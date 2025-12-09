import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,

  IsOptional,
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
export class UpdateApprovalStatusDto {
  @ApiProperty({
    description: 'That is the paystack recipient code',
    example: 'ly_skef3fjg3',
  })
  @IsString()
  @IsNotEmpty()
  recipientCode: string;

  @ApiPropertyOptional({
    description:
      'if the admin rejects a payout request then the reason should be provided',
    example: 'Weekly proofs not complete',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
