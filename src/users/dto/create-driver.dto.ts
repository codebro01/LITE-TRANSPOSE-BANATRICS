import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';



class ImageUploadDto {
  @ApiProperty({
    description: 'Cloudinary secure URL of the uploaded image',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  @IsString()
  @IsNotEmpty()
  secure_url: string;

  @ApiProperty({
    description: 'Cloudinary public ID for the uploaded image',
    example: 'sample_image_id',
  })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}

export class CreateDriverDto {
  // User fields
  @ApiProperty({
    description: 'User phone number',
    example: '+2348012345678',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  // Driver fields
  @ApiProperty({
    description: 'Driver firstname',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstname: string;

  @ApiProperty({
    description: 'Driver lastname',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastname: string;

  @ApiPropertyOptional({
    description: 'Driver profile picture URL',
    example: 'https://example.com/profile.jpg',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  dp?: string;

  @ApiProperty({
    description: 'National Identification Number (NIN) - 11 digits',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'NIN must be exactly 11 digits' })
  nin: string;

  @ApiProperty({
    description: 'State of residence',
    example: 'Lagos',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  state: string;

  @ApiProperty({
    description: 'Local Government Area (LGA)',
    example: 'Ikeja',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lga: string;

  @ApiProperty({
    description: 'Front view image of the vehicle',
    type: ImageUploadDto,
  })
  @ValidateNested()
  @Type(() => ImageUploadDto)
  @IsObject()
  @IsNotEmpty()
  frontview: ImageUploadDto;

  @ApiProperty({
    description: 'Back view image of the vehicle',
    type: ImageUploadDto,
  })
  @ValidateNested()
  @Type(() => ImageUploadDto)
  @IsObject()
  @IsNotEmpty()
  backview: ImageUploadDto;

  @ApiProperty({
    description: 'Side view image of the vehicle',
    type: ImageUploadDto,
  })
  @ValidateNested()
  @Type(() => ImageUploadDto)
  @IsObject()
  @IsNotEmpty()
  sideview: ImageUploadDto;

  @ApiPropertyOptional({
    description: 'Driver license document',
    type: ImageUploadDto,
  })
  @ValidateNested()
  @Type(() => ImageUploadDto)
  @IsObject()
  @IsOptional()
  driverLicense?: ImageUploadDto;

  @ApiPropertyOptional({
    description: 'Vehicle ownership document',
    type: ImageUploadDto,
  })
  @ValidateNested()
  @Type(() => ImageUploadDto)
  @IsObject()
  @IsOptional()
  owershipDocument?: ImageUploadDto;

  @ApiProperty({
    example: 547389,
    description: 'The registered email of the user',
  })
  @IsNotEmpty()
  @IsString()
  emailVerificationCode?: string;
}
