import { Injectable, Inject } from '@nestjs/common';
import { businessOwnerTable, campaignTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, and } from 'drizzle-orm';
import { PaymentRepository } from '@src/payment/repository/payment.repository';

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
        .where(eq(businessOwnerTable.userId, userId))

    ]) 



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
}
