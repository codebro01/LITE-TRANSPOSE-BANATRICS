import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { jwtConstants } from '@src/auth/jwtContants';
import { userTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const access_token =
      request.cookies?.access_token // for browser cookies // for mobile apps
    const refresh_token =
      request.cookies?.refresh_token // for browser cookies // for mobile apps

    if (!access_token && !refresh_token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const token = await this.jwtService.verifyAsync(access_token, {
        secret: jwtConstants.accessTokenSecret,
      });
      if (!token)
        throw new UnauthorizedException(
          'Could not verify token, Unauthorization error',
        );

      // const payload = this.jwtService.verify(token); // verify with secret
      request['user'] = token; // attach user to request
      return true;
    } catch (error) {
      console.log(error);
      if (!refresh_token) {
        response.redirect('/signin');
        throw new UnauthorizedException(
          'Access token expired and no refresh token provided',
        );
      }
      // console.log('got to is not refresh token', refresh_token);
      const token = await this.jwtService.verifyAsync(refresh_token, {
        secret: jwtConstants.refreshTokenSecret,
      });

      // console.log('got to after is not refresh token');
      // console.log(refresh_token, access_token);

      if (!token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { email, id, role } = token;

      const newAccessToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.accessTokenSecret,
        },
      );
      const newRefreshToken = await this.jwtService.signAsync(
        { email, id, role },
        {
          secret: jwtConstants.refreshTokenSecret,
        },
      );

      response.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
      });
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
      });

      // console.log('id', id)

      const newTokenUser = await this.jwtService.verifyAsync(newAccessToken, {
        secret: jwtConstants.accessTokenSecret,
      });
      // console.log('got to newTokenUser');
      await this.DbProvider.update(userTable)
        .set({ refreshToken: newRefreshToken })
        .where(eq(userTable.id, id));
      if (!newTokenUser) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        throw new UnauthorizedException('Token issue failed!!!');
      }
      // console.log(newTokenUser);
  
      request['user']  = newTokenUser; // attach user to request
      return true;
    }
  }
}
