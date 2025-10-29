import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IdType {
  NATIONAL_ID = 'nationalIdCard',
  PASSPORT = 'internationalPassport',
  DRIVERS_LICENSE = 'driversLicense',
  VOTERS_CARD = 'votersCard',
}

export enum ProofOfAddressType {
  ELECTRICITY_BILL = 'electricityBill',
  WATER_BILL = 'waterBill',
  BANK_STATEMENT = 'bankStatement',
}

export class UpdateUserVerificationDto {
  @ApiProperty({
    enum: IdType,
    example: IdType.PASSPORT,
    description: 'The type of identification document provided by the user',
  })
  @IsEnum(IdType)
  idType: IdType;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1691234567/id-front.jpg',
    description: 'URL to the front image of the identification document',
  })
  @IsString()
  idFront: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1691234567/id-back.jpg',
    description: 'URL to the back image of the identification document',
  })
  @IsString()
  idBack: string;

  @ApiProperty({
    enum: ProofOfAddressType,
    example: ProofOfAddressType.BANK_STATEMENT,
    description: 'Type of proof of address provided',
  })
  @IsEnum(ProofOfAddressType)
  proofOfAddressType: ProofOfAddressType;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user’s phone number is verified',
  })
  @IsBoolean()
  isPhoneNumberVerified: boolean;

  @ApiPropertyOptional({
    example: '123 Banana Island Road',
    description: 'Residential address of the user',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Lagos',
    description: 'City of residence',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Nigeria',
    description: 'Country of residence',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: '100001',
    description: 'Postal or ZIP code of the user’s address',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    example: true,
    type: Boolean, 
    description: 'Whether the user has completed this verification stage',
  })
  @IsBoolean()
  isStageComplete?: boolean;
}
