import {
  Body,
  Controller,
  Get,
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
import { createUserDto } from '@src/users/dto/create-user.dto';
import { UpdatebusinessOwnerDto } from '@src/users/dto/update-user.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import omit from 'lodash.omit';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { UpdatePasswordDto } from './dto/updatePasswordDto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ! create users
  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Register new user using the information provided',
  })
  @ApiResponse({ status: 200, description: 'successs' })
  async createUser(@Body() body: createUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.userService.createUser(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(user, ['password', 'refreshToken']);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  //! get all users in db
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a list of all users in the database. Requires admin role.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ! update user basic information
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
