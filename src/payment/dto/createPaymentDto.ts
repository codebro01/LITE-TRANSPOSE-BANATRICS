import { ApiProperty } from "@nestjs/swagger";
import {IsString, IsNotEmpty, IsNumber, IsEnum} from 'class-validator';


export enum PaymentStatusType {
  COMPLETED = 'completed',
  PENDING = 'pending',
}
export enum PaymentMethodType {
    CARD = 'card', 
    TRANSFER = 'transfer'
}

export class CreatePaymentDto {
  @ApiProperty({
    example: 'Advertisement of Cocoa Export',
    description: 'Insert campaign name or title here',
  })
  @IsString()
  @IsNotEmpty()
  campaignName: string;

  @ApiProperty({
    example: 'Advertisement of Cocoa Export',
    description: 'Insert campaign name or title here',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'Klf54jf',
    description: 'Insert campaign name or title here',
  })
  @IsString()
  @IsNotEmpty()
  invoice: string;

  @ApiProperty({
    example: 'Klf54jf',
    enum: PaymentMethodType,
    description: 'payment method type is one of card or transfer',
  })
  @IsEnum(PaymentMethodType, {
    message: 'payment method type is one of card or transfer',
  })
  @IsNotEmpty()
  paymentMethod: PaymentMethodType;

  @ApiProperty({
    example: 'pending',
    enum: PaymentStatusType,
    description: 'payment status type is one of completed or pending',
  })
  @IsEnum(PaymentStatusType, {
    message: 'payment status type is one of completed or pending',
  })
  @IsNotEmpty()
  paymentStatus: PaymentStatusType;
}