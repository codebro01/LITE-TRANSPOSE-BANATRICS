import { ApiProperty,ApiPropertyOptional } from "@nestjs/swagger";
import {IsString, IsNotEmpty, IsNumber} from 'class-validator';



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
  invoiceId: string;

  @ApiPropertyOptional({
    example: '2025-11-05T11:22',
    description: 'Insert date initiated',
  })
  @IsString()
  dateInitiated?: string;

}