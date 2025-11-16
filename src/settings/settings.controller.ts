import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UserService } from '@src/users/users.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { UpdatebusinessOwnerDto } from '@src/users/dto/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { UpdatePasswordDto } from '@src/users/dto/updatePasswordDto';


@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('business/update')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update business owner information',
    description:
      'Updates basic information for the authenticated business owner',
  })
  @ApiBody({ type: UpdatebusinessOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'User information successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateUsers(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatebusinessOwnerDto,
  ) {
    const { id: userId } = req.user;
    const result = await this.userService.updateUserInSettings(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'driver', 'businessOwner')
  @Post('update/password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Updates the password for the authenticated user. Available to admin, driver, and business owner roles.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid password format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async updatePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePasswordDto,
  ) {
    const { id: userId } = req.user;

    console.log('got in here');
    const result = await this.userService.updatePassword(body, userId);
    res.status(HttpStatus.OK).json({
      message: 'success',
      data: result,
    });
  }
}
