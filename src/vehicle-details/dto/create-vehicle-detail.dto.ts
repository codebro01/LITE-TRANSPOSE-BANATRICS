import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Matches,
  Length,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class VehiclePhotoDto {
  @ApiProperty({
    description: 'Secure URL of the uploaded vehicle photo',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/vehicle.jpg',
  })
  @IsString()
  @IsNotEmpty()
  secure_url: string;

  @ApiProperty({
    description: 'Public ID of the uploaded vehicle photo in cloud storage',
    example: 'vehicles/abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}

export class CreateVehicleDetailDto {
  @ApiProperty({
    description: 'Vehicle plate/registration number',
    example: 'LAG-123-XY',
    required: false,
  })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiProperty({
    description: 'The id of the vehicle details, if its been initially updated',
    example: '98e64b6d-e67d-4b46-829a-6fe4edc085c0',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  vehicleDetailsId?: string;

  @ApiProperty({
    description: 'Color of the vehicle',
    example: 'Black',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  color: string;

  @ApiProperty({
    description: 'State where the vehicle is registered',
    example: 'Lagos',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  state: string;

  @ApiProperty({
    description: 'Local Government Area where the vehicle is registered',
    example: 'Ikeja',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  lga: string;

  @ApiProperty({
    description: 'Array of vehicle photos showing different angles',
    type: [VehiclePhotoDto],
    example: [
      {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234567890/front.jpg',
        public_id: 'vehicles/front_123',
      },
      {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234567890/back.jpg',
        public_id: 'vehicles/back_123',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePhotoDto)
  @IsNotEmpty()
  vehiclePhotos: VehiclePhotoDto[];

  @ApiProperty({
    description: 'Year of manufacture of the vehicle (YYYY format)',
    example: '2020',
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, {
    message: 'Year of manufacture must be a 4-digit year (e.g., 2020)',
  })
  @Length(4, 6)
  yearOfManufacture: string;
}
