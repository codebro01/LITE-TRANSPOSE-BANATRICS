import {
  Injectable,
  NotFoundException,Inject,
} from '@nestjs/common';
import {
  businessOwnerTable,
  businessOwnerInsertType,
  userInsertType,
  userTable,
  userSelectType,
  driverTable,
} from '@src/db/users';
import { eq, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async createUser(
    data: Pick<userInsertType, 'email' | 'password' | 'phone' | 'role' | 'emailVerified'>,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable).values(data).returning();

    return user;
  }

  async addBusinessOwnerToBusinessOwnerTable(
    data: { businessName: string; userId: string },
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const [addUserProfile] = await Trx.insert(businessOwnerTable)
      .values({
        businessName: data.businessName,
        userId: data.userId, // Use the actual user.id here, not businessName
      })
      .returning();

    return addUserProfile;
  }
  async addDriverToDriverTable(data: {userId: string, fullName: string}, trx?: any) {
    const Trx = trx || this.DbProvider;

    const [addUserProfile] = await Trx.insert(driverTable)
      .values({
        userId: data.userId, // Use the actual user.id here, not businessName
      })
      .returning();

    return addUserProfile;
  }

  async findByEmailOrPhone(data: { email?: string; phone?: string }) {
    const condition = [];

    if (data.email) condition.push(eq(userTable.email, data.email));
    if (data.phone) condition.push(eq(userTable.phone, data.phone));
    const [user] = await this.DbProvider.select({
      id: userTable.id,
      email: userTable.email,
      phone: userTable.phone,
      role: userTable.role,
    })
      .from(userTable)
      .where(or(...condition));

    return user;
  }

  async updateUserToken(token: string, userId: string) {
    const [user] = await this.DbProvider.update(userTable)
      .set({ refreshToken: token })
      .where(eq(userTable.id, userId))
      .returning();

    return user;
  }

  async getUser(userId: string) {
    const [user] = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!user)
      throw new NotFoundException(`User with Id ${userId} could not be found`);

    return user;
  }

  async updateByUserId(data: Partial<userInsertType>, userId: string) {
    const [user] = await this.DbProvider.update(userTable)
      .set(data)
      .where(eq(userTable.id, userId))
      .returning({
        id: userTable.id,
        email: userTable.email,
        phone: userTable.phone,
      });

    return user;
  }

  async updateBusinessOwnerById(
    data: Partial<businessOwnerInsertType>,
    userId: string,
  ) {
    const [businessOwner] = await this.DbProvider.update(businessOwnerTable)
      .set(data)
      .where(eq(businessOwnerTable.userId, userId))
      .returning({
        businessName: businessOwnerTable.businessName,
      });

    return businessOwner;
  }

  async getStoredPassword(userId: string) {
    const [storedPassword] = await this.DbProvider.select({
      password: userTable.password,
    })
      .from(userTable)
      .where(eq(userTable.id, userId));

    return storedPassword;
  }

  async getAllUsers(): Promise<
    Omit<userSelectType, 'password' | 'refreshToken' | 'passwordResetCode'>[]
  > {
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

  async resetPassword(email: string, hashedPassword: string): Promise<void> {
    await this.DbProvider
      .update(userTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(userTable.email, email));
  }

}
