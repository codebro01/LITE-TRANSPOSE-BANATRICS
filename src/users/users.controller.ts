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

import omit from 'lodash.omit';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { UpdatePasswordDto } from './dto/updatePasswordDto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ! create users
  @Post('signup')
  // @UseGuards(JwtAuthGuard)
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
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ! update user basic information
  @UseGuards(JwtAuthGuard)
  @Post('business/update')
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
