import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendToUserDto {
  @ApiProperty({
    description: 'The external user ID to send the notification to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The title of the push notification',
    example: 'New Appointment',
  })
  @IsString()
  heading: string;

  @ApiProperty({
    description: 'The body message of the push notification',
    example: 'You have a new appointment on March 5th at 2:00 PM',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Additional data payload sent with the notification for in-app navigation or context',
    example: {
      type: 'NEW_APPOINTMENT',
      bookingId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      screen: 'AppointmentDetails',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}