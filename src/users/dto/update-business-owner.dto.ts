import {  ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdatebusinessOwnerDto {
  @ApiPropertyOptional({
    description: 'Business name of the user',
    example: 'Acme Corporation',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Business name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName?: string;

  // @ApiPropertyOptional({
  //   description: 'Business email address',
  //   example: 'contact@acmecorp.com',
  //   format: 'email',
  // })
  // @IsOptional()
  // @IsEmail({}, { message: 'Please provide a valid business email address' })
  // email?: string;

  @ApiPropertyOptional({
    description: 'Phone number (international format)',
    example: '+2348012345678',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message:
      'Phone number must be in valid international format (e.g., +2348012345678)',
  })
  phone?: string;
}
