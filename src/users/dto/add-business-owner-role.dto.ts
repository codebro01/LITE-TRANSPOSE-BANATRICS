// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  BUSINESS_OWNER = 'businessOwner',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export class addBusinessOwnerRoleDto {
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
}
