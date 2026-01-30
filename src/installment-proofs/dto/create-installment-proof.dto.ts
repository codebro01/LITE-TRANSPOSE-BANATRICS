import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageData {
  @ApiProperty({
    description: 'Secure URL of the uploaded image',
    example: 'https://res.cloudinary.com/example/image.jpg',
  })
  @IsString()
  secure_url: string;

  @ApiProperty({
    description: 'Public ID of the image in cloud storage',
    example: 'installment_proofs/abc123',
  })
  @IsString()
  public_id: string;
}

export class CreateInstallmentProofDto {
  @ApiProperty({
    description: 'Backview image data',
    type: ImageData,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ImageData)
  backview: ImageData;

  @ApiProperty({
    description: 'Optional comment about the installment proof',
    required: false,
    example: 'Installed on the rear bumper',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
