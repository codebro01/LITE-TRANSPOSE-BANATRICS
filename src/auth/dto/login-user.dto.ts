import {
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class LoginUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  businessEmail: string;


  @ApiProperty({ example: '@Example123', minLength: 8 })
  @IsString()
  @MinLength(6) // enforce strong-ish password
  password: string;
}
