import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { campaignTable } from '@src/db/campaign';

export type CampaignStatus = 'draft' | 'pending' | 'active' | 'completed';
export type packageType = 'starter' | 'basic' | 'premium' | 'custom';

export type uploadType =  {
  secure_url: string, 
  public_id: string
}

export interface CreateCampaignData {
  packageType?: packageType;
  duration?: string;
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
  uploadMediaFiles?: uploadType[];
  statusType: CampaignStatus;
  updatedAt?: Date;
}

export interface UpdateCampaignData {
  packageType?: packageType;
  duration?: string;
  revisions?: string;
  price?: number;
  noOfDrivers?: number;
  campaignName?: string;
  campaignDescriptions?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  companyLogo?: uploadType | null;
  colorPallete?: string[];
  callToAction?: string;
  mainMessage?: string;
  slogan?: string;
  responseOnSeeingBanner?: string;
  uploadMediaFiles?: uploadType[] | null;
  statusType?: CampaignStatus;
  updatedAt?: Date;
}

@Injectable()
export class CampaignRepository {
  constructor(
    @Inject('DB')
    private DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  /**
   * Create a new campaign
   */
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
          eq(campaignTable.statusType, 'pending'),
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
  async findByStatusAndUserId(userId: string, status: CampaignStatus) {
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
}
