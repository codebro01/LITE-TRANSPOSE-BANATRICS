// cloudinary-file.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CloudinaryFileDto {
  @ApiProperty({
    example: 'https://example.com/media/image.jpg',
    description: 'Cloudinary secure URL',
  })
  @IsString()
  @IsNotEmpty()
  secure_url: string;

  @ApiProperty({
    example: 'folder/file_abc123',
    description: 'Cloudinary public ID',
  })
  @IsString()
  @IsNotEmpty()
  public_id: string;
}
