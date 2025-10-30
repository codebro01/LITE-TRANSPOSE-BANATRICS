// dto/create-campaign.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  MaxLength,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PackageType {
  STARTER = 'starter',
  BASIC = 'basic',
  PREMIUM = 'premium',
  CUSTOM = 'custom',
}

export class CreateCampaignDto {
  @ApiProperty({
    example: 'premium',
    enum: PackageType,
    description: 'Campaign package type',
  })
  @IsEnum(PackageType, {
    message: 'Package type must be one of: starter, basic, premium, custom',
  })
  @IsNotEmpty()
  packageType: PackageType;

  @ApiProperty({
    example: '30 days',
    description: 'Campaign duration',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  duration: string;

  @ApiProperty({
    example: '3 revisions',
    description: 'Number of revisions allowed',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  revisions: string;

  @ApiProperty({
    example: 150000,
    description: 'Campaign price in Naira',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Number of drivers for the campaign',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'At least 1 driver is required' })
  noOfDrivers: number;

  @ApiProperty({
    example: 'Summer Sale 2025',
    description: 'Campaign name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  campaignName: string;

  @ApiProperty({
    example:
      'Promote our summer collection with massive discounts across Lagos',
    description: 'Detailed campaign description',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  campaignDescriptions: string;

  @ApiProperty({
    example: '2025-11-01T00:00:00.000Z',
    description: 'Campaign start date (ISO 8601 format)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2025-11-30T23:59:59.999Z',
    description: 'Campaign end date (ISO 8601 format)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    example: 'https://example.com/uploads/logo.png',
    description: 'URL of uploaded company logo',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  companyLogo: string;

  @ApiProperty({
    example: '#FF5733, #C70039, #900C3F',
    description: 'Color palette for the campaign',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  colorPallete: string;

  @ApiProperty({
    example: 'Shop Now and Save 50%',
    description: 'Call to action text',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  callToAction: string;

  @ApiProperty({
    example: 'Get 50% off on all summer items',
    description: 'Main campaign message',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  mainMessage: string;

  @ApiProperty({
    example: 'Your Style, Our Passion',
    description: 'Campaign slogan (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  slogan?: string;

  @ApiProperty({
    example: 'Visit our website or call 0800-SHOP-NOW',
    description: 'Expected response when people see the banner',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  responseOnSeeingBanner: string;

  @ApiProperty({
    example: [
      'https://example.com/media/image1.jpg',
      'https://example.com/media/video1.mp4',
    ],
    description: 'Array of uploaded media file URLs',
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  uploadMediaFiles?: string[];
}
