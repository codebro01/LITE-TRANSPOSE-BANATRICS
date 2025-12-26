import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateNotificationDto } from '@src/notification/dto/updateNotificationDto';


export class UpdateNotificationsDto extends UpdateNotificationDto {
  @ApiProperty({
    description: 'Array of notification IDs to update',
    example: ['id1', 'id2', 'id3'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}




