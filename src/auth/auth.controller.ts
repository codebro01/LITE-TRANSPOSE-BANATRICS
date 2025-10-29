import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  Get,
  Query,
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
    const { user, accessToken, refreshToken } =
      await this.authService.loginUser(body);

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
      .json({ user: safeUser, accessToken, refreshToken });
  }

  // ! call google api for sign in or signup with google

  // @Get('google')
  // googleLogin(@Res() res: Response) {
  //   const scope = ['openid', 'email', 'profile'].join(' ');
  //   // console.log(this.redirectUri, process.env.SERVER_URI);
  //   const params = qs.stringify({
  //     client_id: this.clientId,
  //     redirect_uri: this.redirectUri,
  //     response_type: 'code', // this is key for server-side OAuth
  //     scope,
  //     access_type: 'offline', // so we get a refresh token
  //     prompt: 'consent', // ensures refresh token is returned every login
  //   });

  //   const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  //   res.redirect(googleUrl);
  // }

  // ! google callback  for signin or signup (this callback returns the user identity from google)

  // @Get('google/callback')
  // async googleCallback(@Query('code') code: string, @Res() res: Response) {
  //   const { data } = await axios.post(
  //     'https://oauth2.googleapis.com/token',
  //     qs.stringify({
  //       code,
  //       client_id: process.env.GOOGLE_CLIENT_ID,
  //       client_secret: process.env.GOOGLE_CLIENT_SECRET,
  //       redirect_uri:
  //         process.env.NODE_ENV === 'production'
  //           ? `${process.env.SERVER_URI}/api/v1/auth/google/callback`
  //           : 'http://localhost:3000/api/v1/auth/google/callback',
  //       grant_type: 'authorization_code',
  //     }),
  //     { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  //   );

  //   const { id_token } = data;

  //   const decoded: any = jwtDecode(id_token); // <-- note the .default

  //   //! generate a ramdon crypto password for google users
  //   const googleUserPwd = this.authService.generateRandomPassword();

  //   const { email, given_name, family_name, picture, email_verified } = decoded;
  //   const payload = {
  //     email,
  //     fullName: `${given_name} ${family_name}`,
  //     dp: picture,
  //     emailVerified: email_verified,
  //     password: googleUserPwd,
  //     authProvider: 'google',
  //   };
  //   const { user, refreshToken, accessToken } =
  //     await this.userService.createUser(payload);

  //   res.cookie('access_token', accessToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'strict',
  //     maxAge: 1000 * 60 * 60, // 1h
  //   });
  //   res.cookie('refresh_token', refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'strict',
  //     maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
  //   });

  //   const safeUser = omit(user, ['password', 'refreshToken']);

  //   res
  //     .status(HttpStatus.ACCEPTED)
  //     .json({ user: safeUser, accessToken, refreshToken });
  // }

  // ! logout route

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logoutUser(@Res() res: Response, @Req() req: Request) {
    await this.authService.logoutUser(res, req);

    res.status(HttpStatus.OK).json({ message: 'Logout Successful' });
  }
}
