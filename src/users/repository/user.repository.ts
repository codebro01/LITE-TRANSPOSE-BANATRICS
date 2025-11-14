import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { businessOwnerTable, businessOwnerInsertType, userInsertType, driverInsertType, userTable, userSelectType, driverTable } from '@src/db/users';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { jwtConstants } from '@src/auth/jwtContants';
import { createUserDto } from '@src/users/dto/create-user.dto';


@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private jwtService: JwtService,
  ) {
    this.DbProvider = DbProvider;
  }

  // ! create user here

  async createUser(data: createUserDto): Promise<any> {
    try {
      const { role } = data;

      // ! ----------------------Create user for business owners--------------------

      if (role && role === 'businessOwner') {
        const { businessName, email, password, phone } = data;

        if (!email || !password || !businessName || !phone)
          throw new BadRequestException(
            'Please email, password, phone and business name is required',
          );

        //! check if email or phone provided has been used

        const [existingUser] = await this.DbProvider.select({
          email: userTable.email,
          phone: userTable.phone,
        })
          .from(userTable)
          .where(or(eq(userTable.email, email), eq(userTable.phone, phone)));

        if (existingUser) {
          // Check which one matched
          if (existingUser.email === email && existingUser.phone === phone) {
            throw new Error('Email and phone number are already in use');
          } else if (existingUser.email === email) {
            throw new Error('Email is already in use');
          } else {
            throw new Error('Phone number is already in use');
          }
        }

        //! create user here if email has not been used
        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await this.DbProvider.transaction(async (tx) => {
          // First insert - user
          const [user] = (await tx
            .insert(userTable)
            .values({
              email: data.email,
              phone: data.phone,
              password: hashedPwd,
              role,
            })
            .returning()) as userInsertType[];

          if (!user || !user.id) {
            throw new InternalServerErrorException(
              'Could not create user, please try again',
            );
          }

          // Second insert - business owner profile
          const [addUserProfile] = (await tx
            .insert(businessOwnerTable)
            .values({
              businessName: businessName,
              userId: user.id, // Use the actual user.id here, not businessName
            })
            .returning()) as businessOwnerInsertType[];

          if (!addUserProfile) {
            throw new InternalServerErrorException(
              'Could not create user profile, please try again',
            );
          }

          return { user, addUserProfile };
        });

        // Access the results
        const { user } = result;
        const payload = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

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
          .where(eq(userTable.id, user.id!));

        if (!updateUserToken) throw new InternalServerErrorException();
        return { user, accessToken, refreshToken };
      }

      // ! ---------------Create user for drivers----------------------

      if (role && role === 'driver') {
        const { fullName, email, password, phone } = data;

        if (!email || !password || !fullName || !phone)
          throw new BadRequestException(
            'Please email, password, phone and business Fullname is required',
          );

        //! check if email or phone provided has been used

        const [existingUser] = await this.DbProvider.select({
          email: userTable.email,
          phone: userTable.phone,
        })
          .from(userTable)
          .where(or(eq(userTable.email, email), eq(userTable.phone, phone)));

        if (existingUser) {
          // Check which one matched
          if (existingUser.email === email && existingUser.phone === phone) {
            throw new Error('Email and phone number are already in use');
          } else if (existingUser.email === email) {
            throw new Error('Email is already in use');
          } else {
            throw new Error('Phone number is already in use');
          }
        }

        //! create user here if email has not been used
        const hashedPwd = await bcrypt.hash(password, 10);

        const result = await this.DbProvider.transaction(async (tx) => {
          // First insert - user
          const [user] = (await tx
            .insert(userTable)
            .values({
              email: data.email,
              phone: data.phone,
              password: hashedPwd,
              role,
            })
            .returning()) as userInsertType[];

          if (!user || !user.id) {
            throw new InternalServerErrorException(
              'Could not create user, please try again',
            );
          }

          // Second insert - business owner profile
          const [addUserProfile] = (await tx
            .insert(driverTable)
            .values({
              fullName: fullName,
              userId: user.id, // Use the actual user.id here, not businessName
            })
            .returning()) as driverInsertType[];

          if (!addUserProfile) {
            throw new InternalServerErrorException(
              'Could not create user profile, please try again',
            );
          }

          return { user, addUserProfile };
        });

        // Access the results
        const { user } = result;
        const payload = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

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
          .where(eq(userTable.id, user.id!));

        if (!updateUserToken) throw new InternalServerErrorException();
        return { user, accessToken, refreshToken };
      }
    } catch (dbError) {
      console.error('DB Insert Error:', dbError);


      throw dbError;
    }
  }

  async getAllUsers(): Promise<Omit<userSelectType, 'password' | 'refreshToken'>[]> {
    const users = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
      emailVerified: userTable.emailVerified,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    }).from(userTable);

    return users;
  }

  async updateUser(
    user,
    data: Omit<businessOwnerInsertType, 'email' | 'password'>,
  ) {
    // console.log('user', user);
    if (!data) throw new BadRequestException('Data not provided for update!');
    const [isUserExist] = await this.DbProvider.select({
      id: userTable.id,
    })
      .from(userTable)
      .where(eq(userTable.id, user.id));

    if (!isUserExist) throw new NotFoundException('No user found');
    // console.log(isUserExist);
    const updatedUser = await this.DbProvider.update(userTable)
      .set(data)
      .where(eq(userTable.id, user.id))
      .returning();
    if (!updatedUser)
      throw new InternalServerErrorException(
        'An error occurred while updating the user, please try again',
      );
    // console.log('updatedUser', updatedUser);
    return { updatedUser };
  }

  async getUser(userId: string) {
       const [user] = await this.DbProvider.select().from(userTable).where(eq(userTable.id, userId))

       if(!user) throw new NotFoundException(`User with Id ${userId} could not be found`)
        

        return user;
  }
}
