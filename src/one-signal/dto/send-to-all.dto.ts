import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendToAllDto {
  @ApiProperty({
    description: 'The title of the push notification',
    example: 'Platform Announcement',
  })
  @IsString()
  heading: string;

  @ApiProperty({
    description: 'The body message of the push notification',
    example:
      'We have exciting new features available. Update your app to get started!',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description:
      'Additional data payload sent with the notification for in-app navigation or context',
    example: {
      type: 'ANNOUNCEMENT',
      screen: 'WhatsNew',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}