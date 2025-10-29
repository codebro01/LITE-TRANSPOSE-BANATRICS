import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { usersTable } from '@src/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { jwtConstants } from '../jwtContants';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

interface customRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
    @Inject('NEON_CLIENT') private readonly supabase: SupabaseClient,
    private readonly jwtService: JwtService,
  ) {}
  async loginUser(data: { email: string; password: string }) {
    const { email, password } = data;

    if (!email || !password)
      throw new BadRequestException('Please provide email and password');
    const [user] = await this.DbProvider.select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user)
      throw new UnauthorizedException(
        'Bad credentials, Please check email and password',
      );
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new UnauthorizedException(
        'Bad credentials, Please check email and password',
      );

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: '30d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updateUserToken = await this.DbProvider.update(usersTable)
      .set({ refreshToken: hashedRefreshToken })
      .where(eq(usersTable.id, user.id));

    if (!updateUserToken) throw new InternalServerErrorException();
    return { user, accessToken, refreshToken };
  }

  async logoutUser(res: Response, req: customRequest) {
    const user = req.user;
    if (!user)
      throw new NotFoundException('No user payload, no user is logged in');
    console.log(user);
    await this.DbProvider.update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, user.id));
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
