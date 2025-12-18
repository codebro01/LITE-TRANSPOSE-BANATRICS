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
  driverInsertType,
} from '@src/db/users';
import { addBusinessOwnerRoleDto } from '@src/users/dto/add-business-owner-role.dto';
import { AddDriverRoleDto } from '@src/users/dto/add-driver-role.dto';
import { CreateDriverDto } from '@src/users/dto/create-driver.dto';
import { eq, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


@Injectable()
export class UserRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async createUser(
    data: Pick<
      userInsertType,
      'email' | 'password' | 'phone' | 'role' | 'emailVerified'
    >,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.insert(userTable).values(data).returning();

    return user;
  }

  async findUserById(userId: string) {
    const user = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));
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
        userId: data.userId, // Use the actual user.id
      })
      .returning();

    return addUserProfile;
  }
  async addDriverToDriverTable(
    data: CreateDriverDto,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const [addUserProfile] = await Trx.insert(driverTable)
      .values({
        userId: userId, // Use the actual user.id

        ...data,
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

  async updateByUserId(
    data: Partial<userInsertType>,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const [user] = await Trx.update(userTable)
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
  async updateDriverById(
    data: Partial<driverInsertType>,
    userId: string,
  ) {
    const [driver] = await this.DbProvider.update(driverTable)
      .set(data)
      .where(eq(driverTable.userId, userId))
      .returning({
        firstname: driverTable.firstname,
        lastname: driverTable.lastname,
        address: driverTable.address,
      });

    return driver;
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
    await this.DbProvider.update(userTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(userTable.email, email));
  }

  async findDriverByUserId(userId: string) {
    const user = await this.DbProvider.select()
      .from(driverTable)
      .where(eq(driverTable.userId, userId));
    return user;
  }

  async updateDriverDp(
    dp: { secure_url: string; public_id: string },
    userId: string,
  ) {
    const [driver] = await this.DbProvider.update(driverTable)
      .set({ dp: dp })
      .where(eq(driverTable.userId, userId))
      .returning({ dp: driverTable.dp });
    return driver;
  }

  async addDriverRole(data: AddDriverRoleDto, userId: string) {
    await this.DbProvider.transaction(async (trx) => {
      await this.updateByUserId(
        { role: ['businessOwner', 'driver'] },
        userId,
        trx,
      );
      await trx.insert(driverTable).values({...data, userId});
    });

    return { success: true };
  }
  async addBusinessOwnerRole(data: addBusinessOwnerRoleDto, userId: string) {
    await this.DbProvider.transaction(async (trx) => {
      await this.updateByUserId(
        { role: ['driver', 'businessOwner'] },
        userId,
        trx,
      );
      await this.addBusinessOwnerToBusinessOwnerTable({businessName: data.businessName, userId}, trx);
    });

    return { success: true };
  }

  async findDriverById(userId: string) {
    return await this.DbProvider.select().from(driverTable).where(eq(driverTable.userId, userId))
  }

  async getDriverProfile(userId: string) {
    return await this.DbProvider.select({
      id: userTable.id, 
      email: userTable.email, 
      phone: userTable.phone, 
      state: driverTable.state, 
      createdAt: userTable.createdAt, 
      firstname: driverTable.firstname, 
      lastname: driverTable.lastname, 
      dp: driverTable.dp, 

    }).from(driverTable).where(eq(driverTable.userId, userId)).leftJoin(userTable, eq(userTable.id, userId));
  }
  async getBusinessOwnerProfile(userId: string) {
    return await this.DbProvider.select({
      id: userTable.id, 
      email: userTable.email, 
      phone: userTable.phone, 
      businessName: businessOwnerTable.businessName, 

    }).from(businessOwnerTable).where(eq(businessOwnerTable.userId, userId)).leftJoin(userTable, eq(userTable.id, userId));
  }
}
