import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, IsNotEmpty } from "class-validator";


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



export class UpdateNotificationDto {
  @ApiPropertyOptional({
    example: 'Campaign has been success published',
    description:
      'This is the title of the notification, it must be short and yet straigt forward',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example:
      'Your campaign has been successfully publised, dont forget to track campaign progress, active drivers from your dashboard. If you have questions dont hesitate to reach out to ur customer care, thanks.',
    description: 'This is the body of the notification',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
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

  @ApiPropertyOptional({
    example: 'info',
    description:
      'variant allows the frontend to know which icon to use in notification display and variant is either of warning, info, success or danger',
    enum: VariantType,
  })
  @IsEnum(VariantType, {
    message: 'Variant is either of warning, info, success or danger',
  })
  @IsOptional()
  variant?: VariantType;

  @ApiPropertyOptional({
    example: 'payment',
    description:
      'This is used to distiguish notifications that are sent based on different purposes',
    enum: CategoryType,
  })
  @IsEnum(CategoryType, {
    message: 'Category is either of campaign or payment',
  })
  @IsOptional()
  category?: CategoryType;

  @ApiPropertyOptional({
    example: 'important',
    description:
      'This is used to alert user on the importance of the notification',
  })
  @IsString()
  @IsOptional()
  priority?: string;
}