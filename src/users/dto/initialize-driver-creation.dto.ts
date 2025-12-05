import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class InitializeDriverCreationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The registered email of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '09098394800',
    description: 'The registered email of the user',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the driver',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '12345678901',
    description:
      'The National Identification Number of the driver (must be exactly 11 digits)',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'NIN must be exactly 11 digits' })
  nin: string;
}