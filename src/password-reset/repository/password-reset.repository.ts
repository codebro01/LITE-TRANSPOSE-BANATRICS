import { Inject, Injectable } from "@nestjs/common";
import { PasswordResetInsertType, passwordResetTable } from "@src/db";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";


@Injectable()
export class PasswordResetRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createPasswordResetData(data: PasswordResetInsertType) {
    await this.DbProvider.insert(passwordResetTable).values(data);

    return { message: 'success' };
  }

  async findUserByEmail(data: Pick<PasswordResetInsertType, 'email'>) {
    const [user] = await this.DbProvider.select()
      .from(passwordResetTable)
      .where(eq(passwordResetTable.email, data.email))
      .limit(1);

    return user;
  }

  async updatePasswordReset(
    
    data: Partial<
      Pick<
        PasswordResetInsertType,
        'attempts' | 'passwordResetCode' | 'used' | 'createdAt' | 'expiresAt'
      >
    >,
    email: string,
  ) {
    const [update] = await this.DbProvider.update(passwordResetTable)
      .set(data)
      .where(eq(passwordResetTable.email, email))
      .returning();

    return update;
  }


  async invalidateExistingCodes(email: string) {
    await this.DbProvider
      .update(passwordResetTable)
      .set({ used: true })
      .where(
        and(eq(passwordResetTable.email, email), eq(passwordResetTable.used, false)),
      );
  }

  async invalidateAllCodesForUser(userId: string) {
    await this.DbProvider
      .update(passwordResetTable)
      .set({ used: true })
      .where(eq(passwordResetTable.userId, userId));
  }
}