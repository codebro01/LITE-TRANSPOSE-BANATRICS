import { Injectable, Inject } from '@nestjs/common';
import { invoicesInsertType, invoicesTable } from '@src/db';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


@Injectable()
export class InvoiceRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async create(data: Omit<invoicesInsertType, 'userId' | 'campaignId'>,campaignId: string,  userId: string, trx?:any) {
    const Trx = trx || this.DbProvider;
    const invoice = await Trx.insert(invoicesTable)
      .values({
        ...data,
        userId, 
        campaignId,
      })
      .returning();

    return invoice;
  }

  async getInvoice(campaignId: string, userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const invoice = await Trx.select()
      .from(invoicesTable)
      .where(
        and(
          eq(invoicesTable.userId, userId),
          eq(invoicesTable.campaignId, campaignId),
        ),
      );

    return invoice;
  }
}
