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
import { JwtService } from '@nestjs/jwt';
// import { jwtDecode } from 'jwt-decode';
import { UserService } from '@src/users/users.service';
import omit from 'lodash.omit';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Groups your endpoints
@Controller('auth')
export class AuthController {
  // private clientId = process.env.GOOGLE_CLIENT_ID;
  // private redirectUri =
  //   process.env.NODE_ENV === 'production'
  //     ? `${process.env.SERVER_URI}/api/v1/auth/google/callback`
  //     : 'http://localhost:3000/api/v1/auth/google/callback';
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // ! local signin (password and email)
  @Post('signin')
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async loginUser(@Body() body: LoginUserDto, @Res() res: Response) {
    const {
      user,
      accessToken,
      refreshToken,
    } = await this.authService.loginUser(body);

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

    res
      .status(HttpStatus.ACCEPTED)
      .json({ user: safeUser, accessToken });
  }


  

  // ! logout route

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logoutUser(@Res() res: Response, @Req() req: Request) {
    await this.authService.logoutUser(res, req);

    res.status(HttpStatus.OK).json({ message: 'Logout Successful' });
  }
}
