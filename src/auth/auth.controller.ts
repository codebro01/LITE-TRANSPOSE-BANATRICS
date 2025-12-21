import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { LoginUserDto } from '@src/auth/dto/login-user.dto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { JwtService } from '@nestjs/jwt';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';import { UserService } from '@src/users/users.service';
import omit from 'lodash.omit';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // ! local signin (password and email)
  @Post('signin')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates a user with email and password, returns user data and access token, and sets authentication cookies.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 202,
    description: 'User successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          description: 'User data without sensitive information',
        },
        accessToken: {
          type: 'string',
          description: 'JWT access token',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid credentials or input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
  })
  async loginUser(@Body() body: LoginUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1h
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
    });

    const safeUser = omit(user, ['password', 'refreshToken']);

    res.status(HttpStatus.ACCEPTED).json({ user: safeUser, accessToken });
  }

  // ! logout route

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logs out the authenticated user by clearing authentication cookies and invalidating the session.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logout Successful',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logoutUser(@Res() res: Response, @Req() req: Request) {
    await this.authService.logoutUser(res, req);

    res.status(HttpStatus.OK).json({ message: 'Logout Successful' });
  }
}
