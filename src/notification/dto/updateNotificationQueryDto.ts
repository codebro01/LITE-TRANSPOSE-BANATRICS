import { Transform } from 'class-transformer';
import { IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationsQueryDto {
    @ApiProperty({
        example: "https://banatrics.web?ids=id1,id2,id3, and so on"
    })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',');
    return Array.isArray(value) ? value : [value];
  })
  ids: string[];
}

