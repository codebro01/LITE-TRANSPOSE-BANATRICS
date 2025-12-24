import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql, ne, lt } from 'drizzle-orm';
import { campaignTable } from '@src/db/campaigns';
import { MaintenanceType, StatusType } from '../dto/publishCampaignDto';
import { driverCampaignTable } from '@src/db';
import {
  CreateDriverCampaignDto,
  DriverCampaignStatusType,
} from '@src/campaign/dto/create-driver-campaign.dto';
import { updatePricePerDriverPerCampaign } from '@src/campaign/dto/update-price-per-driver-per-campaign.dto';

export type CampaignStatus = 'draft' | 'pending' | 'active' | 'completed';
export type packageType = 'starter' | 'basic' | 'premium' | 'custom';

export type uploadType = {
  secure_url: string;
  public_id: string;
};

export interface CreateCampaignData {
  packageType?: packageType;
  duration?: number;
  revisions?: string;
  price?: number;
  noOfDrivers?: number;
  campaignName?: string;
  campaignDescriptions?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  companyLogo?: uploadType;
  colorPallete?: string[];
  callToAction?: string;
  mainMessage?: string;
  slogan?: string;
  responseOnSeeingBanner?: string;
  uploadedImages?: uploadType[];
  statusType: CampaignStatus;
  updatedAt?: Date;
  maintenanceType?: MaintenanceType;
  lgaCoverage?: string;
}

export interface UpdateCampaignData {
  packageType?: packageType;
  duration?: number;
  revisions?: string;
  price?: number;
  noOfDrivers?: number;
  campaignName?: string;
  campaignDescriptions?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  colorPallete?: string[];
  callToAction?: string;
  mainMessage?: string;
  companyLogo?: {
    secure_url: string;
    public_id: string;
  };
  slogan?: string;
  responseOnSeeingBanner?: string;
  uploadedImages?: uploadType[];
  statusType?: CampaignStatus;
  updatedAt?: Date;
  maintenanceType?: MaintenanceType;
  lgaCoverage?: string;
}

@Injectable()
export class CampaignRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  //!===================================business owner db calls ===========================================//

  //Create a new campaign
  async create(data: CreateCampaignData, userId: string) {
    const [campaign] = await this.DbProvider.insert(campaignTable)
      .values({ userId, ...data })
      .returning();

    return campaign;
  }
  async draftCampaign(data: UpdateCampaignData, userId: string) {
    const [campaign] = await this.DbProvider.insert(campaignTable)
      .values({ userId, ...data })
      .returning();

    return campaign;
  }

  /**
   * Find a campaign by ID and user ID
   */
  async findByIdAndUserId(id: string, userId: string) {
    const [campaign] = await this.DbProvider.select()
      .from(campaignTable)
      .where(and(eq(campaignTable.id, id), eq(campaignTable.userId, userId)))
      .limit(1);

    return campaign || null;
  }

  /**
   * Find a draft campaign by ID and user ID
   */
  async findDraftByIdAndUserId(id: string, userId: string) {
    const [campaign] = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.id, id),
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'draft'),
        ),
      )
      .limit(1);

    return campaign || null;
  }
  async findByStatus(userId: string, status: any) {
    const [campaign] = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, status),
        ),
      )
      .limit(1);

    return campaign || null;
  }

  /**
   * Update a campaign by ID
   */
  async updateById(id: string, data: UpdateCampaignData, userId: string) {
    const [updated] = await this.DbProvider.update(campaignTable)
      .set(data)
      .where(and(eq(campaignTable.id, id), eq(campaignTable.userId, userId)))
      .returning();

    return updated;
  }

  /**
   * Find all campaigns for a user
   */
  async findAllByUserId(userId: string) {
    const campaigns = await this.DbProvider.select()
      .from(campaignTable)
      .where(eq(campaignTable.userId, userId));

    return campaigns;
  }

  /**
   * Find all draft campaigns for a user
   */
  async findDraftsByUserId(userId: string) {
    const drafts = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'draft'),
        ),
      );

    return drafts;
  }

  /*
  ! Find all published (pending) campaigns for a user
   */
  async findPublishedByUserId(userId: string) {
    const campaigns = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'active'),
        ),
      );

    return campaigns;
  }

  //! Find all completed  campaigns for a user

  async findCompletedByUserId(userId: string) {
    const campaigns = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'completed'),
        ),
      );

    return campaigns;
  }
  //! Find all active  campaigns for a user

  async findActiveByUserId(userId: string) {
    const campaigns = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'active'),
        ),
      );

    return campaigns;
  }

  /**
   * Find campaigns by status for a user
   */
  async findByStatusAndUserId(userId: string, status: StatusType) {
    const campaigns = await this.DbProvider.select()
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, status),
        ),
      );

    return campaigns;
  }

  /**
   * Count campaigns for a user
   */
  async countByUserId(userId: string): Promise<number> {
    const campaigns = await this.findAllByUserId(userId);
    return campaigns.length;
  }

  /**
   * Delete a campaign by ID and user ID
   */
  async deleteByIdAndUserId(id: string, userId: string) {
    const [deleted] = await this.DbProvider.delete(campaignTable)
      .where(
        and(
          eq(campaignTable.id, id),
          eq(campaignTable.userId, userId),
          eq(campaignTable.statusType, 'draft'),
        ),
      )
      .returning();

    return deleted || null;
  }

async findActiveCampaignByCampaignId(campaignId:string) {
      const campaigns = await this.DbProvider.select({
        id: campaignTable.id,
        title: campaignTable.campaignName,
        state: campaignTable.state,
        duration: campaignTable.duration,
        availability: campaignTable.availability,
        requirements: campaignTable.requirements,
        noOfDrivers: campaignTable.noOfDrivers,
        description: campaignTable.campaignDescriptions,
        
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.statusType, 'active'),
            eq(campaignTable.paymentStatus, 'spent'),
            eq(campaignTable.id, campaignId),
          ),
        );


        return campaigns
}



  //!===================================drivers db calls ===========================================//

  async findDriverCampaignById(campaignId: string, userId: string) {
    const [campaign] = await this.DbProvider.select({
      campaignId: campaignTable.id,
      paid: driverCampaignTable.paid,
      earningPerDriver: campaignTable.earningPerDriver,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.campaignId, campaignId),
          eq(driverCampaignTable.userId, userId),
        ),
      )
      .leftJoin(campaignTable, eq(campaignTable.id, campaignId))
      .limit(1);
    return campaign;
  }

  async getAllAvailableCampaigns() {
    const campaigns = await this.DbProvider.select({
      title: campaignTable.campaignName,
      campaignId: campaignTable.id,
      state: campaignTable.state,
      startDate: campaignTable.startDate,
      endDate: campaignTable.endDate,
      duration: campaignTable.duration,
      availability: campaignTable.availability,
      requirements: campaignTable.requirements,
      description: campaignTable.campaignDescriptions,
      totalEarning: campaignTable.earningPerDriver,
      TotalNumberOfDrivers: campaignTable.noOfDrivers,
      totalDriversApplied: sql<number>`COUNT(${driverCampaignTable.id})::int`,
    })
      .from(campaignTable)
      .leftJoin(
        driverCampaignTable,
        eq(campaignTable.id, driverCampaignTable.campaignId),
      )
      .where(
        and(
          eq(campaignTable.statusType, 'active'),
          eq(campaignTable.paymentStatus, 'spent'),
        ),
      )
      .groupBy(campaignTable.id)
      .having(
        sql`COUNT(${driverCampaignTable.id}) < ${campaignTable.noOfDrivers}`,
      );

    const [count] = await this.DbProvider.select({
      totalCount: sql<number>`COUNT(*)`,
      todayCount: sql<number>`COUNT(*) filter (where date(${campaignTable.createdAt}) = current_date)`,
    })
      .from(campaignTable)
      .where(
        and(
          eq(campaignTable.statusType, 'active'),
          eq(campaignTable.paymentStatus, 'spent'),
        ),
      );
    return { campaigns, ...count };
  }

  async driverCampaignDashboard(userId: string) {
    const [calc, campaignsExcludingPendingApproval] = await Promise.all([
      this.DbProvider.select({
        totalActiveCampaigns: sql<number>`COUNT(CASE WHEN active_status = true THEN 1 END) `,
        totalCompletedCampaigns: sql<number>`COUNT(CASE WHEN campaign_status = 'completed' THEN 1 END)`,
      })
        .from(driverCampaignTable)
        .where(eq(driverCampaignTable.userId, userId)),

      this.DbProvider.select({
        eligibleCampaigns: sql<number>`COUNT(*)`,
      })
        .from(driverCampaignTable)
        .where(
          and(
            ne(driverCampaignTable.campaignStatus, 'pending_approval'),
            eq(driverCampaignTable.userId, userId),
          ),
        ),
    ]);

    return {
      campaignCounts: calc[0],
      eligibleCampaignsCount: campaignsExcludingPendingApproval[0],
    };
  }

  // async getGetAllDriverCampaigns(userId: string) {
  //   const campaigns = await this.DbProvider.select({
  //     driverCampaignStatus: driverCampaignTable.campaignStatus,
  //     title: campaignTable.campaignName,
  //     state: campaignTable.state,
  //     startDate: campaignTable.startDate,
  //     duration: campaignTable.duration,
  //     availability: campaignTable.availability,
  //     requirements: campaignTable.requirements,
  //     description: campaignTable.campaignDescriptions,
  //     totalEarning: campaignTable.earningPerDriver,
  //     endDate: campaignTable.endDate,
  //   })
  //     .from(driverCampaignTable)
  //     .where(eq(driverCampaignTable.userId, userId))
  //     .leftJoin(
  //       campaignTable,
  //       eq(campaignTable.id, driverCampaignTable.campaignId),
  //     );
  //   return campaigns;
  // }

  async countTotalNoOfDriverAppliedForCampaign(campaignId: string) {
    const total = await this.DbProvider.select({
      total: sql<number>`COUNT(*)`,
    })
      .from(driverCampaignTable)
      .where(eq(driverCampaignTable.campaignId, campaignId));

    return total[0]?.total ?? 0;
  }

  async getDriverCampaignsById(userId: string) {
    const campaigns = await this.DbProvider.select({
      driverCampaignStatus: driverCampaignTable.campaignStatus,
      title: campaignTable.campaignName,
      campaignId: campaignTable.id,
      state: campaignTable.state,
      startDate: campaignTable.startDate,
      endDate: campaignTable.endDate,
      duration: campaignTable.duration,
      availability: campaignTable.availability,
      requirements: campaignTable.requirements,
      description: campaignTable.campaignDescriptions,
      totalEarning: campaignTable.earningPerDriver,
    })
      .from(driverCampaignTable)
      .where(eq(driverCampaignTable.userId, userId))
      .leftJoin(
        campaignTable,
        eq(driverCampaignTable.campaignId, campaignTable.id),
      );
    return campaigns;
  }

  async filterDriverCampaigns(
    filter: DriverCampaignStatusType,
    userId: string,
  ) {
    const campaign = await this.DbProvider.select()
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.campaignStatus, filter),
          eq(driverCampaignTable.userId, userId),
        ),
      );
    return campaign;
  }

  async getAllActiveCampaigns(userId: string) {
    const campaigns = await this.DbProvider.select({
      activeStatus: driverCampaignTable.active,
      title: campaignTable.campaignName,
      state: campaignTable.state,
      driverCampaignStatus: driverCampaignTable.campaignStatus,
      startDate: campaignTable.startDate,
      duration: campaignTable.duration,
      availability: campaignTable.availability,
      requirements: campaignTable.requirements,
      description: campaignTable.campaignDescriptions,
      totalEarning: campaignTable.earningPerDriver,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          eq(driverCampaignTable.active, true),
        ),
      )
      .leftJoin(
        campaignTable,
        eq(driverCampaignTable.campaignId, campaignTable.id),
      );

    return campaigns;
  }
  async getAllCompletedCampaigns(userId: string) {
    const campaigns = await this.DbProvider.select({
      driverCampaignStatus: driverCampaignTable.campaignStatus,
      title: campaignTable.campaignName,
      totalEarning: campaignTable.earningPerDriver,
    })
      .from(driverCampaignTable)
      .where(
        and(
          eq(driverCampaignTable.userId, userId),
          eq(
            driverCampaignTable.campaignStatus,
            DriverCampaignStatusType.COMPLETED,
          ),
        ),
      )
      .leftJoin(
        campaignTable,
        eq(driverCampaignTable.campaignId, campaignTable.id),
      );

    return campaigns;
  }

  async driverApplyForCampaign(data: CreateDriverCampaignDto, userId: string) {
    const alreadyApplied = await this.findDriverCampaignById(
      data.campaignId,
      userId,
    );

    if (alreadyApplied)
      throw new BadRequestException(
        'You have already applied for this  campaign!!!',
      );
    await this.DbProvider.insert(driverCampaignTable).values({
      ...data,
      userId,
    });
  }

  // ! ============================ admin section ===============================
  async handleCampaignStatusUpdate() {
    const now = new Date();

    const result = await this.DbProvider.update(campaignTable)
      .set({
        statusType: 'completed',
        updatedAt: now,
      })
      .where(
        and(
          lt(campaignTable.endDate, now),
          ne(campaignTable.statusType, 'completed'),
        ),
      )
      .returning({
        id: campaignTable.id,
        campaignName: campaignTable.campaignName,
      });

    return result;
  }

  async updateCampaignStatusManually() {
    const now = new Date();

    const result = await this.DbProvider.update(campaignTable)
      .set({
        statusType: 'completed',
        updatedAt: now,
      })
      .where(
        and(
          lt(campaignTable.endDate, now),
          ne(campaignTable.statusType, 'completed'),
        ),
      )
      .returning({
        id: campaignTable.id,
        campaignName: campaignTable.campaignName,
      });

    return {
      success: true,
      updatedCount: result.length,
      campaigns: result,
    };
  }

  async updatePricePerDriverPerCampaign(data: updatePricePerDriverPerCampaign) {
    const campaign = await this.DbProvider.update(campaignTable)
      .set({ earningPerDriver: data.earningPerDriver })
      .where(eq(campaignTable.id, data.campaignId));
    return campaign;
  }
}
