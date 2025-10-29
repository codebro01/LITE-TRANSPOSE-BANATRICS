// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatebusinessOwnerDto {

  @ApiProperty({ example: 'Banatrics' })
  @IsString()
  @IsNotEmpty()
  businessName: string;


  @ApiProperty({ example: 'sales@banatrics.com' })
  @IsString()
  @IsNotEmpty()
  businessEmail: string;

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
