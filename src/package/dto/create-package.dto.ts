import {
  IsInt,
  IsString,
  Min,
  MaxLength,
  IsPositive,
  IsNotEmpty,
  IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PackageType } from '@src/campaign/dto/publishCampaignDto';
import { MaintenanceType } from '@src/campaign/dto/publishCampaignDto';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Admin/User ID who created the package',
    example: '68d48751-8f11-4f5a-ab63-012ff02429d2',
    format: 'uuid',
  })
  @ApiProperty({
    description: 'Package duration in days',
    example: 30,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt({ message: 'duration must be an integer' })
  @IsPositive({ message: 'duration must be a positive number' })
  duration: number;

  @ApiProperty({
    description: 'Number of revisions allowed',
    example: '3',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString({ message: 'revisions must be a string' })
  revisions: string;

  @ApiProperty({
    description: 'Package price in  kobo',
    example: 15000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt({ message: 'price must be an integer' })
  @Min(0, { message: 'price must be zero or positive' })
  price: number;

  @ApiProperty({
    description: 'Local Government Area coverage',
    example: '5',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString({ message: 'lgaCoverage must be a string' })
  @MaxLength(10, { message: 'lgaCoverage must not exceed 10 characters' })
  lgaCoverage: string;

  @ApiProperty({
    description: 'Number of drivers included in the package',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt({ message: 'noOfDrivers must be an integer' })
  @IsPositive({ message: 'noOfDrivers must be a positive number' })
  noOfDrivers: number;

  @ApiProperty({
    description: 'This is the package type is goint to be created by the admin, and its either of starter, package, premium', 
    example: 'starter',
  })
  @IsNotEmpty()
  @IsEnum(PackageType, { message: 'noOfDrivers must be an integer' })
  packageType: PackageType;

  @ApiProperty({
    description: 'This is the maintenance type of the package selected, and its either of basic, standard, or premium',
    example: 'basic',
  })
  @IsNotEmpty()
  @IsEnum(MaintenanceType, { message: 'noOfDrivers must be an integer' })
  maintenanceType: MaintenanceType;
}
