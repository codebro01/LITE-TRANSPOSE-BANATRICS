import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OneSignalService } from './one-signal.service';
import { SendToSubscriptionDto } from '@src/one-signal/dto/send-to-subscription.dto';
import { SendToUserDto } from '@src/one-signal/dto/send-to-user.dto';
import { SendToAllDto } from '@src/one-signal/dto/send-to-all.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader } from '@nestjs/swagger';

@Controller('one-signal')
export class OneSignalController {
  constructor(private readonly oneSignalService: OneSignalService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Post('send-to-user')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendToUser(@Body() dto: SendToUserDto) {
    const sendToAllUser = await this.oneSignalService.sendNotificationToUser(
      dto.userId,
      dto.heading,
      dto.content,
      dto.data,
    );

    return {
      success: true,
      data: sendToAllUser,
      message: 'message sent successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Post('send-to-subscription')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendToSubscription(@Body() dto: SendToSubscriptionDto) {
    const sendNotificationToSubscription =
      await this.oneSignalService.sendNotificationToSubscription(
        dto.subscriptionId,
        dto.heading,
        dto.content,
        dto.data,
      );

    return {
      success: true,
      data: sendNotificationToSubscription,
      message: 'Notification send to subscription',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'consultant', 'patient')
  @Post('send-to-all')
  @ApiBearerAuth('JWT-auth') // For mobile clients
  @ApiCookieAuth('access_token')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @HttpCode(HttpStatus.OK)
  async sendToAll(@Body() dto: SendToAllDto) {
    const sendToAll = await this.oneSignalService.sendNotificationToAll(
      dto.heading,
      dto.content,
      dto.data,
    );

    return {
      success: true,
      data: sendToAll,
      message: 'message sent to all successfully',
    };
  }
}
