import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class DeleteImagesDto {
  @ApiProperty({
    description: 'Array of images public IDs to delete',
    example: ['id1', 'id2', 'id3'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  public_ids: string[];
}




