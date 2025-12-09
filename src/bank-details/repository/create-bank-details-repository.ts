import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { bankDetailsInsertType, bankDetailsTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class BankDetailsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async findOneById(userId: string) {
    const user = await this.DbProvider.select().from(bankDetailsTable).where(eq(bankDetailsTable.userId, userId));
    return user;
  }

  async createBankDetailsRecord(
    data: bankDetailsInsertType,
    userId: string,
    trx?: any,
  ) {
    const isBankDetailsExist = await this.findOneById(userId);
    if(isBankDetailsExist.length > 0) throw new BadRequestException('User already submitted their bank account information')
    const Trx = trx || this.DbProvider;
    const [createBankDetailsRecord] = await Trx.insert(bankDetailsTable)
      .values({
        ...data,
        userId,
      })
      .returning({
        bankName: bankDetailsTable.bankName,
        accountName: bankDetailsTable.accountName,
        accountNumber: bankDetailsTable.accountNumber,
      });
    return createBankDetailsRecord;
  }
}
