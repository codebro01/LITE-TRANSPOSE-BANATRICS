// src/users/dto/create-user.dto.ts
import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export enum UserRole {
  BUSINESS_OWNER = 'businessOwner',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export class createUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({ example: 'Banatrics' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  businessName: string;

  @ApiProperty({ example: 'businessOwner' })
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'Role must be one of: businessOwner, driver, admin',
  })
  role: UserRole;

  @ApiProperty({ example: 'sales@banatrics.com' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: '+234000000000' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '@Example123', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
  })
  password: string;
}
