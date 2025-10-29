import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  usersTable,
  UserType,
} from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SupabaseClient } from '@supabase/supabase-js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { jwtConstants } from '@src/auth/jwtContants';
// import PasswordValidator from 'password-validator';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    @Inject('NEON_CLIENT') private supabase: SupabaseClient,
    private jwtService: JwtService,
  ) {
    this.DbProvider = DbProvider;
    this.supabase = supabase;
  }

  // ! create user here

  async createUser(
    data: Pick<UserType, 'email' | 'password' | 'fullName' | 'authProvider'>,
  ): Promise<any> {
    try {
      const { email, password } = data;
      if (!email || !password)
        throw new BadRequestException('Please email and password is required');
      const hashedPwd = await bcrypt.hash(password, 10);

      // !check is google user is already in db before signing up

      if (data.authProvider === 'google') {
        const [user] = await this.DbProvider.select()
          .from(usersTable)
          .where(eq(usersTable.email, email));
        if (user) {
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
      }


      //! check if email provided has been used

      const isEmailUsed = await this.DbProvider.select({email: usersTable.email}).from(usersTable).where(eq(usersTable.email, email));
      console.log(isEmailUsed);
      if(isEmailUsed.length > 0) throw new ConflictException('Email already used, please use another email!')

      //! create user here if email has not been used

      const [user]: Partial<UserType>[] = (await this.DbProvider.insert(
        usersTable,
      )
        .values({
          ...data,
          password: hashedPwd,
        })
        .returning()) as UserType[];

      if (!user) throw new InternalServerErrorException('Could not create user, please try again');

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
        .where(eq(usersTable.id, user.id!));

      if (!updateUserToken) throw new InternalServerErrorException();
      return { user, accessToken, refreshToken };
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);

      // rollback Supabase user if DB fails

      throw dbError;
    }
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.DbProvider.select().from(usersTable);
    return users;
  }

  async updateUser(user, data: Omit<UserType, 'email' | 'password'>) {
    console.log('user', user)
    if (!data) throw new BadRequestException('Data not provided for update!');
    const [isUserExist] = await this.DbProvider.select({id: usersTable.id}).from(usersTable).where(eq(usersTable.id, user.id))
    
    if(!isUserExist) throw new NotFoundException('No user found');
    console.log(isUserExist);
    const updatedUser = await this.DbProvider.update(usersTable)
      .set(data)
      .where(eq(usersTable.id, user.id))
      .returning();
    if (!updatedUser)
      throw new InternalServerErrorException(
        'An error occurred while updating the user, please try again',
      );
      console.log('updatedUser', updatedUser)
    return { updatedUser };
  }

}
