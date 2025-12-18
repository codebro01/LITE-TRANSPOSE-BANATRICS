import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateDriverProfileDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Ahmed',
    type: String,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Musa',
    type: String,
  })
  @IsString()
  @IsOptional()
  lastName?: string;


  @ApiProperty({
    description: 'Phone number of the user with country code',
    example: '+234 801 234 5678',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Physical address of the user',
    example: '123 Main Street, Ilorin, Kwara State',
    type: String,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
