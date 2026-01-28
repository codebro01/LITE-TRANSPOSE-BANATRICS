import {
 
  Inject,
  Injectable,
} from '@nestjs/common';
import {  businessOwnerTable, driverTable, userTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
// import { driverTable } from '@src/db';




@Injectable()
export class AuthRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db/users')>,
    private readonly jwtService: JwtService,
  ) {}

  async findUserByEmailOrPhone(email?: string, phone?: string) {
    let whereClause;
    if (email && phone) {
      whereClause = or(eq(userTable.email, email), eq(userTable.phone, phone));
    } else if (email) {
      whereClause = eq(userTable.email, email);
    } else if (phone) {
      whereClause = eq(userTable.phone, phone);
    }

    const [user] = await this.DbProvider.select()
      .from(userTable)
      .where(whereClause);

    return user;
  }

  async findUserById(userId: string) {
    const [user] = await this.DbProvider.select().from(userTable).where(eq(userTable.id, userId));

    return user;
  }

  async updateUserToken(refreshToken: string | null, userId: string) {
    const updateUserToken = await this.DbProvider.update(userTable)
      .set({ refreshToken: refreshToken })
      .where(eq(userTable.id, userId));

    return updateUserToken;
  }

  async findDriverStatusById(userId: string) {
    const [user] = await this.DbProvider.select({
      id: driverTable.userId, 
      activeStatus: driverTable.activeStatus, 
      approvedStatus: driverTable.approvedStatus, 
    }).from(driverTable).where(eq(driverTable.userId, userId));

    return user;
  }
  async findBusinessOwnerStatusById(userId: string) {
    const [user] = await this.DbProvider.select({
      id: businessOwnerTable.userId, 
      status: businessOwnerTable.status, 
    }).from(businessOwnerTable).where(eq(businessOwnerTable.userId, userId));

    return user;
  }

}
