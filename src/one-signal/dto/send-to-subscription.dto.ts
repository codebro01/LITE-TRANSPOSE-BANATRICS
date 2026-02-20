import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendToSubscriptionDto {
  @ApiProperty({
    description: 'The OneSignal subscription ID of the target device',
    example: 'b3c9e7a2-4f1d-4e8a-9c2b-1d3f5e7a9b0c',
  })
  @IsString()
  subscriptionId: string;

  @ApiProperty({
    description: 'The title of the push notification',
    example: 'Appointment Reminder',
  })
  @IsString()
  heading: string;

  @ApiProperty({
    description: 'The body message of the push notification',
    example: 'Your appointment is in 30 minutes',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description:
      'Additional data payload sent with the notification for in-app navigation or context',
    example: {
      type: 'APPOINTMENT_REMINDER',
      bookingId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      screen: 'AppointmentDetails',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}


