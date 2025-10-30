import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {  userTable } from '@src/db';
import { SupabaseClient } from '@supabase/supabase-js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or } from 'drizzle-orm';
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
  async loginUser(data: { email?: string; password: string; phone?: string }) {
    const { email, password, phone } = data;

    if ((!phone && !email) || !password)
      throw new BadRequestException('Please provide email and password');

    let whereClause;
    if (email && phone) {
      whereClause = or(eq(userTable.email, email), eq(userTable.phone, phone));
    } else if (email) {
      whereClause = eq(userTable.email, email);
    } else {
      whereClause = eq(userTable.phone, phone!);
    }


    const [user] = await this.DbProvider.select()
    .from(userTable)
    .where(whereClause);
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

    const updateUserToken = await this.DbProvider.update(userTable)
      .set({ refreshToken: hashedRefreshToken })
      .where(eq(userTable.id, user.id));



    if (!updateUserToken) throw new InternalServerErrorException();
    return { user, accessToken, refreshToken };
  }

  async logoutUser(res: Response, req: customRequest) {
    const user = req.user;
    if (!user)
      throw new NotFoundException('No user payload, no user is logged in');
    console.log(user);
    await this.DbProvider.update(userTable)
      .set({ refreshToken: null })
      .where(eq(userTable.id, user.id));
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
