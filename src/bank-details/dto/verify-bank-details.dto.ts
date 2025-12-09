// dto/initialize-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class VerifyBankDetailsDto {
  @ApiProperty({
    description: 'Account Number of the user',
    example: '0001234567',
    maxLength: 10,
    type: String,
  })
  @IsNotEmpty()
  @IsString({ message: 'Account Number must be a string' })
  @MaxLength(10, { message: 'Account number cannot exceed 10 characters' })
  accountNumber: string;

  @ApiProperty({
    description: 'The bank code of the bank',
    example: '058',
    maxLength: 200,
    type: String,
  })
  @IsNotEmpty()
  @IsString({ message: 'Bank code must be a string' })
  @MaxLength(10, { message: 'Bank code cannot exceed 10 characters' })
  bankCode: string;
}
