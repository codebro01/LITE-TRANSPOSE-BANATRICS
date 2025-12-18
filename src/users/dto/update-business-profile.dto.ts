import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional, IsString, Matches } from 'class-validator';

export class UpdateBusinessOwnerProfileDto {
  @ApiProperty({
    description: 'the name of the business that owns this account',
    example: 'Banatrics Inc.',
    type: String,
  })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({
    description: 'Phone number of the user with country code',
    example: '+234 801 234 5678',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phoneNumber?: string;
}
