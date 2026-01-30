import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export enum CampaignDesignStatusType {
  APPROVED = 'approved',
  REJECT = 'rejected',
}

export class UpdateCampaignDesignDto {
  @ApiProperty({
    example: 'approved',
    description:
      'The status to be submitted is accepted then approved else reject',
  })
  @IsNotEmpty()
  @IsEnum(CampaignDesignStatusType)
  approvalStatus: CampaignDesignStatusType;

  @ApiProperty({
    example: 'Well designed',
    description: 'The comment of the business owner with respect to the design',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
