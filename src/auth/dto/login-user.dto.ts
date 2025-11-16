import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginUserDto {
  @ApiProperty({ example: 'codebroman@xyz.com' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'Banatrics@123', minLength: 8 })
  @IsString()
  @MinLength(6) // enforce strong-ish password
  password: string;
}
