import {  IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakePaymentForCampaignDto {

  @ApiProperty({
    example: '0cba4f64-ef51-4570-bd41-07652e66d89d',
    description:
      'enter the campaign id in this field',
  })
  @IsNotEmpty()
  @IsString()
  campaignId: string;
}
