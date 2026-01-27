import { IsString, IsEmail, MinLength, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';


export enum userType {
  DRIVER = 'driver', 
  BUSINESSOWNER = 'businessOwner'
}

export class LoginUserDto {
  @ApiProperty({ example: 'codebroman@xyz.com' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'Banatrics@123', minLength: 8 })
  @IsString()
  @MaxLength(128)
  @MinLength(8) // enforce strong-ish password
  password: string;

  @ApiProperty({
    example: 'driver',
    description: 'The user type that wants to be authenticated',
  })
  @IsNotEmpty()
  @IsEnum(userType)
  userType: userType;
}
