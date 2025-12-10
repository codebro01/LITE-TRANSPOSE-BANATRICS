import { Injectable, Inject } from '@nestjs/common';
import {
  businessOwnerTable,
  campaignTable,
  driverCampaignTable,
  driverTable,
} from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and } from 'drizzle-orm';
import { earningsTable } from '@src/db/earnings';
import { ApprovalStatusType } from '@src/earning/dto/create-earning.dto';

@Injectable()
export class HomeDashboardsRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async businessOwnerHomeDashboard(userId: string) {
    const [[campaign], [totalSpent], [balance]] = await Promise.all([
      this.DbProvider.select({
        totalCampaigns: sql<number>`COUNT(DISTINCT ${campaignTable.id})`,
        activeCampaigns: sql<number>`COUNT(DISTINCT CASE WHEN ${campaignTable.statusType} = 'active' THEN ${campaignTable.id} END)`,
        noOfDrivers: sql<number>`SUM(CASE WHEN ${campaignTable.statusType} = 'active' THEN ${campaignTable.noOfDrivers} ELSE 0 END)`,
      })
        .from(campaignTable)
        .where(eq(campaignTable.userId, userId)),

      this.DbProvider.select({
        totalSpent: sql<number>`SUM(${campaignTable.price})`,
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.userId, userId),
            eq(campaignTable.paymentStatus, 'spent'),
          ),
        ),

      this.DbProvider.select({
        balance: businessOwnerTable.balance,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId)),
    ]);

    // console.log({
    //   balance: String(balance.balance),
    //   totalSpent: totalSpent.totalSpent,
    //   totalCampaign: campaign.totalCampaigns,
    //   activeCampaign: campaign.activeCampaigns,
    //   totalNoOfDriver: campaign.noOfDrivers,
    // });

    return {
      balance: String(balance.balance),
      totalSpent: totalSpent.totalSpent,
      totalCampaign: campaign.totalCampaigns,
      activeCampaign: campaign.activeCampaigns,
      totalNoOfDriver: campaign.noOfDrivers,
    };
  }
  async driverHomeDashboard(userId: string) {
    const [
      [totalEarning],
      [activeCampaign],
      [pendingPayout],
      [totalCampaignDone],
      yourCampaign,
    ] = await Promise.all([
      this.DbProvider.select({
        total: sql<number>`COALESCE(SUM(${earningsTable.amount}), 0)`,
      })
        .from(earningsTable)
        .where(
          and(
            eq(earningsTable.userId, userId),
            eq(earningsTable.approved, ApprovalStatusType.APPROVED),
          ),
        ),

      this.DbProvider.select({
        active: sql<number>`COUNT(*)`,
      })
        .from(driverCampaignTable)
        .where(
          and(
            eq(driverCampaignTable.userId, userId),
            eq(driverCampaignTable.active, true),
          ),
        ),

      this.DbProvider.select({
        pendng: driverTable.pending,
      })
        .from(driverTable)
        .where(eq(driverTable.userId, userId)),

      this.DbProvider.select({
        total: sql<number>`COUNT(*)`,
      })
        .from(driverCampaignTable)
        .where(
          and(
            eq(driverCampaignTable.userId, userId),
            eq(driverCampaignTable.campaignStatus, 'completed'),
          ),
        ),
      this.DbProvider.select({
        amount: campaignTable.earningPerDriver,
        title: campaignTable.campaignName,
        endDate: campaignTable.endDate,
        campaignStatus: driverCampaignTable.campaignStatus,
      })
        .from(driverCampaignTable)
        .where(eq(driverCampaignTable.userId, userId))
        .leftJoin(
          campaignTable,
          eq(campaignTable.id, driverCampaignTable.campaignId),
        ),
    ]);

    // console.log({
    //   balance: String(balance.balance),
    //   totalSpent: totalSpent.totalSpent,
    //   totalCampaign: campaign.totalCampaigns,
    //   activeCampaign: campaign.activeCampaigns,
    //   totalNoOfDriver: campaign.noOfDrivers,
    // });

    return {
      totalEarning: String(totalEarning.total),
      activeCampaign: activeCampaign.active,
      pendingPayout: String(pendingPayout.pendng),
      totalCampaignDone: totalCampaignDone.total,
      yourCampaign,
    };
  }
}
