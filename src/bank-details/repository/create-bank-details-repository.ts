import { Inject, Injectable } from '@nestjs/common';
import { bankDetailsInsertType, bankDetailsTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class BankDetailsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async createBankDetailsRecord(
    data: bankDetailsInsertType,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const createBankDetailsRecord = await Trx.insert(bankDetailsTable).values({
      ...data,
      userId,
    });
    return createBankDetailsRecord;
  }
}
