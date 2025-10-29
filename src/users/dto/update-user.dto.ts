import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatebusinessOwnerDto {
  @ApiPropertyOptional({
    example: true,
    description: "Indicates whether the user's email has been verified",
  })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    example: 'Banatrics',
    description: 'Business name',
  })
  @IsString()
  @IsOptional()
  businessName: string;

  @ApiPropertyOptional({
    example: 'sales@banatrics.com',
    description: 'email of the business',
  })
  @IsString()
  @IsOptional()
  businessEmail: string;

  @ApiPropertyOptional({ example: '+234000000000' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1691234567/avatar.jpg',
    description: 'Profile picture (URL)',
  })
  @IsString()
  @IsOptional()
  businessLogo?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, Lagos',
    description: 'Business address',
  })
  @IsString()
  @IsOptional()
  businessAddress?: string;
}
