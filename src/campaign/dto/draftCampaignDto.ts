// dto/create-campaign.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PackageType {
  STARTER = 'starter',
  BASIC = 'basic',
  PREMIUM = 'premium',
  CUSTOM = 'custom',
}
export enum StatusType {
  PENDING = 'pending',
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export class DraftCampaignDto {
  @ApiProperty({
    example: 'premium',
    enum: PackageType,
    description: 'Campaign package type',
  })
  @IsEnum(PackageType, {
    message: 'Package type must be one of: starter, basic, premium, custom',
  })
  @IsOptional()
  packageType: PackageType;

  @ApiProperty({
    example: 'draft',
    enum: StatusType,
    description: 'Campaign status type',
  })
  @IsEnum(StatusType, {
    message: 'Status type must be one of: pending, draft, active, completed',
  })
  @IsOptional()
  statusType: StatusType;

  @ApiProperty({
    example: 30,
    description:
      'Campaign duration is a number and its calculated in days so 30 means 30 days',
  })
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty({
    example: '3 revisions',
    description: 'Number of revisions allowed',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  revisions: string;

  @ApiProperty({
    example: 150000,
    description: 'Campaign price in Naira',
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Number of drivers for the campaign',
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'At least 1 driver is required' })
  noOfDrivers: number;

  @ApiProperty({
    example: 'Summer Sale 2025',
    description: 'Campaign name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  campaignName: string;

  @ApiProperty({
    example:
      'Promote our summer collection with massive discounts across Lagos',
    description: 'Detailed campaign description',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  campaignDescriptions: string;

  @ApiProperty({
    example: '2025-11-01T00:00:00.000Z',
    description: 'Campaign start date (ISO 8601 format)',
  })
  @IsDateString()
  @IsOptional()
  startDate: string;


  @ApiProperty({
    example: ['#FF5733', '#C70039', '#900C3F'],
    description: 'Color palette for the campaign',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colorPallete: string[];

  @ApiProperty({
    example: 'Shop Now and Save 50%',
    description: 'Call to action text',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  callToAction: string;

  @ApiProperty({
    example: 'Get 50% off on all summer items',
    description: 'Main campaign message',
  })
  @IsString()
  @IsOptional()
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
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  responseOnSeeingBanner: string;

  @ApiProperty({
    example: [
      {
        secure_url: 'https://example.com/media/image1.jpg',
        public_id: 'media_xyz789',
      },
      {
        secure_url: 'https://example.com/media/image2.jpg',
        public_id: 'media_def456',
      },
    ],
    description:
      'Existing media files that were uploaded initially when saving the draft',
  })
  @IsArray()
  @IsOptional()
  uploadedImages: Array<{
    secure_url: string;
    public_id: string;
  }>;

  @ApiProperty({
    example: {
      secure_url: 'https://example.com/media/logo.jpg',
      public_id: 'logo_abc123',
    },
    description:
      'Existing logo info that was uploaded initially when saving the draft',
  })
  @IsOptional()
  existingLogo?: {
    secure_url: string;
    public_id: string;
  };

  @ApiProperty({
    example: [
      {
        secure_url: 'https://example.com/media/image1.jpg',
        public_id: 'media_xyz789',
      },
      {
        secure_url: 'https://example.com/media/image2.jpg',
        public_id: 'media_def456',
      },
    ],
    description:
      'Existing media files that were uploaded initially when saving the draft',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  existingMediaFiles?: Array<{
    secure_url: string;
    public_id: string;
  }>;

  @ApiProperty({
    example: {
      secure_url: 'https://example.com/media/logo.jpg',
      public_id: 'logo_abc123',
    },
    description:
      'Existing logo info that was uploaded initially when saving the draft',
  })
  @IsOptional()
  companyLogo: {
    secure_url: string;
    public_id: string;
  };
}
