import {IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class DeleteImageDto {
  @ApiProperty({
    description: 'Public id of the image to be deleted',
    example: 'my-folder/gzgm58lm0waafed6idxa',
  })
  @IsNotEmpty()
  @IsString()
  public_id: string;
}




