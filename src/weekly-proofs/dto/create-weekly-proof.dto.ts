import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageProofDto {
  @ApiProperty({
    description: 'Secure URL of the uploaded image',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  @IsString()
  @IsNotEmpty()
  secure_url: string;

  @ApiProperty({
    description: 'Public ID of the uploaded image in cloud storage',
    example: 'weekly_proofs/abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}

enum WeeklyProofStatus {
  APPROVED = 'approved',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

export class CreateWeeklyProofDto {
  @ApiProperty({
    description: 'UUID of the campaign this weekly proof belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;


  @ApiProperty({
    description: 'Front view image proof of the vehicle wrap',
    type: ImageProofDto,
  })
  @ValidateNested()
  @Type(() => ImageProofDto)
  @IsNotEmpty()
  frontview: ImageProofDto;

  @ApiProperty({
    description: 'Back view image proof of the vehicle wrap',
    type: ImageProofDto,
  })
  @ValidateNested()
  @Type(() => ImageProofDto)
  @IsNotEmpty()
  backview: ImageProofDto;

  @ApiProperty({
    description: 'Side view image proof of the vehicle wrap',
    type: ImageProofDto,
  })
  @ValidateNested()
  @Type(() => ImageProofDto)
  @IsNotEmpty()
  sideview: ImageProofDto;

  @ApiPropertyOptional({
    description:
      'Optional comment or note from the driver about this weekly proof submission',
    example: 'Vehicle wrap is in good condition, drove 500 miles this week',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Month number (1-12) for which this weekly proof is submitted',
    example: 11,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({
    description: 'Status of the weekly proof submission',
    enum: WeeklyProofStatus,
    default: 'pending_review',
    example: 'pending_review',
  })
  @IsEnum(WeeklyProofStatus)
  @IsOptional()
  statusType?: WeeklyProofStatus;

  @ApiPropertyOptional({
    description: 'Reason for rejection if the weekly proof was rejected',
    example: 'Images are unclear, please resubmit with better quality photos',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
