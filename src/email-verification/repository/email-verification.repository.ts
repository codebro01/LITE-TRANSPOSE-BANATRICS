import { Inject, Injectable } from "@nestjs/common";
import { EmailVerificationInsertType, emailVerificationTable } from "@src/db";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";


@Injectable()
export class EmailVerificationRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createEmailVerificationData(data: EmailVerificationInsertType) {
   const savedEmail =  await this.DbProvider.insert(emailVerificationTable).values(data).returning();

    return { message: 'success', data: savedEmail };
  }

  async findUserByEmail(data: Pick<EmailVerificationInsertType, 'email'>) {
    const [user] = await this.DbProvider.select()
      .from(emailVerificationTable)
      .where(eq(emailVerificationTable.email, data.email))
      .limit(1);

    return user;
  }

  async updateEmailVerification(
    
    data: Partial<
      Pick<
        EmailVerificationInsertType,
        'attempts' | 'emailVerificationCode' | 'used' | 'createdAt' | 'expiresAt'
      >
    >,
    email: string,
  ) {
    const [update] = await this.DbProvider.update(emailVerificationTable)
      .set(data)
      .where(eq(emailVerificationTable.email, email))
      .returning();


          return { message: 'success', data: update };
  }


  async invalidateExistingCodes(email: string) {
    await this.DbProvider
      .update(emailVerificationTable)
      .set({ used: true })
      .where(
        and(eq(emailVerificationTable.email, email), eq(emailVerificationTable.used, false)),
      );
  }

  async invalidateAllCodesForUser(email: string) {
    await this.DbProvider
      .update(emailVerificationTable)
      .set({ used: true })
      .where(eq(emailVerificationTable.email, email));
  }
}