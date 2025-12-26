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
  }