// dto/initialize-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class InitializePaymentDto {

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
    description: 'URL to redirect to after payment',
    example: 'https://yourapp.com/payment/callback',
    type: String,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Callback URL must be a valid URL' })
  callback_url?: string;

}
