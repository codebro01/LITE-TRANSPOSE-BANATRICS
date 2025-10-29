import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    description: "User's display name or username",
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Indicates whether the user's email has been verified",
  })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiPropertyOptional({
    example: '1995-08-15',
    description: 'Date of birth of the user (ISO 8601 format)',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender of the user',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1691234567/avatar.jpg',
    description: 'Profile picture (URL)',
  })
  @IsString()
  @IsOptional()
  dp?: string;

  @ApiPropertyOptional({
    example: '+2348012345678',
    description: "User's phone number (include country code)",
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, Lagos',
    description: "User's address",
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'Jane Doe - +2348098765432',
    description: 'Emergency contact information',
  })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: '70kg',
    description: "User's weight",
  })
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiPropertyOptional({
    example: '175cm',
    description: "User's height",
  })
  @IsString()
  @IsOptional()
  height?: string;

  @ApiPropertyOptional({
    example: 'O+',
    description: "User's blood group",
  })
  @IsString()
  @IsOptional()
  bloodType?: string;

  @ApiPropertyOptional({
    example: 'google',
    description: 'Authentication provider (e.g., google, facebook, local)',
  })
  @IsString()
  @IsOptional()
  authProvider?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user has completed this profile update stage',
  })
  @IsBoolean()
  @IsOptional()
  isStageComplete?: boolean;
}