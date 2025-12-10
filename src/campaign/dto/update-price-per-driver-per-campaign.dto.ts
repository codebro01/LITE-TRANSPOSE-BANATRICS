import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";


export class updatePricePerDriverPerCampaign {
  @ApiProperty({
    description: 'Campaign id of the campaign',
    example: '98e64b6d-e67d-4b46-829a-6fe4edc085c0',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({
    description: 'Price of each driver in Naira',
    example: 55747,
  })
  @IsNumber()
  @IsNotEmpty()
  earningPerDriver: number;
}