import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsNotEmpty } from "class-validator";


export enum StatusType {
 'READ' = 'read', 
 'UNREAD' = 'unread', 
}
export enum VariantType {
 'INFO' = 'info', 
 'SUCCESS' = 'success', 
 'WARNING' = 'warning', 
 'DANGER' = 'danger', 
}

export enum CategoryType {
  'CAMPAIGN' = 'campaign',
  'PAYMENT' = 'payment',

}



export class CreateNotificationDto {
  @ApiProperty({
    example: 'Campaign has been success published',
    description:
      'This is the title of the notification, it must be short and yet straigt forward',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Your campaign has been successfully publised, dont forget to track campaign progress, active drivers from your dashboard. If you have questions dont hesitate to reach out to ur customer care, thanks.',
    description: 'This is the body of the notification',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'read',
    description:
      'This is the status of the message, it either the user has read it or has not read it, but the frontend can only send the read, a frontend cannot send unread, its unread by default',
    enum: StatusType,
  })
  @IsEnum(StatusType, {
    message: 'Status type must be one of read or unread',
  })
  @IsNotEmpty()
  status: StatusType;

  @ApiProperty({
    example: 'info',
    description:
      'variant allows the frontend to know which icon to use in notification display and variant is either of warning, info, success or danger',
    enum: VariantType,
  })
  @IsEnum(VariantType, {
    message: 'Variant is either of warning, info, success or danger',
  })
  @IsNotEmpty()
  variant: VariantType;

  @ApiProperty({
    example: 'payment',
    description:
      'This is used to distiguish notifications that are sent based on different purposes',
    enum: CategoryType,
  })
  @IsEnum(CategoryType, {
    message: 'Category is either of campaign or payment',
  })
  @IsNotEmpty()
  category: CategoryType;

  @ApiProperty({
    example: 'important',
    description:
      'This is used to alert user on the importance of the notification',
  })
  @IsString()
  @IsNotEmpty()
  priority: string;
}