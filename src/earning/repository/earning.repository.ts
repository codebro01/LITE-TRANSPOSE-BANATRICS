import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { earningsTable, earningTableInsertType } from '@src/db/earnings';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql, gte, sum, count } from 'drizzle-orm';
import { startOfMonth } from 'date-fns';
import { campaignTable, driverTable } from '@src/db';
import { ApprovalStatusType } from '@src/earning/dto/create-earning.dto';
import { UpdateApprovalStatusDto } from '@src/earning/dto/update-approved-status.dto';
import { CampaignStatus } from '@src/campaign/repository/campaign.repository';

@Injectable()
export class EarningRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async findEarningsByApproved(userId: string) {
    const earnings = await this.DbProvider.select()
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.approved, ApprovalStatusType.UNAPPROVED),
          eq(earningsTable.userId, userId),
        ),
      );
    return earnings;
  }

  async createEarnings(data: earningTableInsertType, trx?: any) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.insert(earningsTable).values({ ...data });

    return earnings;
  }

  //   async getDriverBalance(userId: string) {
  //     const [driver] = await this.DbProvider.select({
  //       balance: driverTable.balance,
  //     })
  //       .from(driverTable)
  //       .where(eq(driverTable.userId, userId))
  //       .limit(1);

  //     return driver.balance;

  async monthlyEarningBreakdown(userId: string) {
    const earnings = await this.DbProvider.select({
      year: sql<number>`EXTRACT(YEAR FROM ${campaignTable.updatedAt})`,
      month: sql<number>`EXTRACT(MONTH FROM ${campaignTable.updatedAt})`,
      totalEarning: sum(campaignTable.earningPerDriver),
      numCampaigns: count(campaignTable.id),
    })
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, CampaignStatus.COMPLETED),
        ),
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${campaignTable.updatedAt})`,
        sql`EXTRACT(MONTH FROM ${campaignTable.updatedAt})`,
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${campaignTable.updatedAt})`,
        sql`EXTRACT(MONTH FROM ${campaignTable.updatedAt})`,
      )
      .execute();

    return earnings;
  }

  async requestPayouts(
    data: earningTableInsertType,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.insert(earningsTable)
      .values({
        ...data,
        userId,
      })
      .returning();

    return earnings;
  }
  async updateEarningApprovedStatus(
    approved: boolean,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.update(earningsTable)
      .set({ approved })
      .where(
        and(
          eq(earningsTable.approved, ApprovalStatusType.UNAPPROVED),
          eq(earningsTable.userId, userId),
        ),
      );

    return earnings;
  }

  async getAllUnapprovedEarnings(trx?: any) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.select()
      .from(earningsTable)
      .where(and(eq(earningsTable.approved, ApprovalStatusType.UNAPPROVED)));

    return earnings;
  }
  async listAllTransactions(userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.select()
      .from(earningsTable)
      .where(and(eq(earningsTable.userId, userId)));

    return earnings;
  }

  async getTotalEarnings(userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.select({
      total: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`,
    })
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.approved, ApprovalStatusType.APPROVED),
          eq(earningsTable.userId, userId),
        ),
      );

    return earnings.total;
  }

  async availableBalance(userId: string) {
    const [balance] = await this.DbProvider.select({
      balance: driverTable.balance,
    })
      .from(driverTable)
      .where(eq(driverTable.userId, userId));
    return balance.balance;
  }

  async pendingBalance(userId: string) {
    const [balance] = await this.DbProvider.select({
      pending: driverTable.pending,
    })
      .from(driverTable)
      .where(eq(driverTable.userId, userId));
    return balance.pending;
  }

  async amountMadeThisMonth(userId: string) {
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now); // e.g., 2025-12-01T00:00:00

    const [result] = await this.DbProvider.select({
      total: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`,
    })
      .from(earningsTable)
      .where(
        and(
          eq(earningsTable.userId, userId),
          gte(earningsTable.updatedAt, firstDayOfMonth), // only this month
          eq(earningsTable.approved, ApprovalStatusType.APPROVED), // optional filter
        ),
      );

    return result.total;
  }

  async approvePayouts(
    data: UpdateApprovalStatusDto,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    const earnings = await Trx.update(earningsTable)
      .set({
        approved: ApprovalStatusType.APPROVED,
        paymentStatus: 'PAID',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(earningsTable.approved, ApprovalStatusType.UNAPPROVED),
          eq(earningsTable.userId, userId),
          eq(earningsTable.recipientCode, data.recipientCode),
        ),
      );

    return earnings;
  }

  async rejectPayouts(
    data: UpdateApprovalStatusDto,
    userId: string,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;

    if (!data.rejectionReason)
      throw new BadRequestException(
        'Please rejection reason should be provided by admin...',
      );

    const earnings = await Trx.update(earningsTable)
      .set({
        approved: ApprovalStatusType.REJECTED,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(earningsTable.approved, ApprovalStatusType.UNAPPROVED),
          eq(earningsTable.userId, userId),
          eq(earningsTable.recipientCode, data.recipientCode),
        ),
      );

    return earnings;
  }
}
