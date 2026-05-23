import { Injectable, Inject } from '@nestjs/common';
import { campaignTable, weeklyProofInsertType, weeklyProofTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql, count, inArray} from 'drizzle-orm';
import { WeeklyProofStatus } from '../dto/create-weekly-proof.dto';

@Injectable()
export class WeeklyProofsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(data: Omit<weeklyProofInsertType, 'userId'>, userId: string) {
    const [weeklyProof] = await this.DbProvider.insert(weeklyProofTable)
      .values({
        ...data,
        userId,
      })
      .returning();

    return weeklyProof;
  }

  async findByWeek(
    userId: string,
    campaignId: string,
    year: number,
    weekNumber: number,
  ) {
    const [result] = await this.DbProvider.select()
      .from(weeklyProofTable)
      .where(
        and(
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.campaignId, campaignId),
          eq(weeklyProofTable.year, year),
          eq(weeklyProofTable.weekNumber, weekNumber),
        ),
      )
      .limit(1);

    return result;
  }
  async findAllByUserId(userId: string) {
    const weeklyProof = await this.DbProvider.select({
      id: weeklyProofTable.id,
      campaignName: campaignTable.campaignName,
      campaignId: campaignTable.id,
      date: weeklyProofTable.createdAt,
      photoCount: sql<number>`
      (CASE WHEN ${weeklyProofTable.backview} IS NOT NULL THEN 1 ELSE 0 END)
    `.as('photo_count'),
      status: weeklyProofTable.statusType,
      images: {
        backview: weeklyProofTable.backview,
      },
    })
      .from(weeklyProofTable)
      .where(eq(weeklyProofTable.userId, userId))
      .leftJoin(
        campaignTable,
        eq(campaignTable.id, weeklyProofTable.campaignId),
      );

    return weeklyProof;
  }

  async findOneByUserId(weeklyProofId: string, userId: string) {
    const weeklyProof = await this.DbProvider.select()
      .from(weeklyProofTable)
      .where(
        and(
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.id, weeklyProofId),
        ),
      );

    return weeklyProof;
  }

  async update(
    data: Partial<Omit<weeklyProofInsertType, 'userId' | 'campaignId'>>,
    weeklyProofId: string,
    userId: string,
  ) {
    const [weeklyProof] = await this.DbProvider.update(weeklyProofTable)
      .set({
        ...data,
        statusType: 'pending_review',
      })
      .where(
        and(
          eq(weeklyProofTable.id, weeklyProofId),
          eq(weeklyProofTable.userId, userId),
        ),
      )
      .returning();

    return weeklyProof;
  }

  remove(userId: string) {
    return `This action removes a #${userId} weeklyProof`;
  }

  async getAllApprovedWeeklyProofsForCampaign(
    campaignId: string,
    userId: string,
  ) {
    const [weeklyProofs] = await this.DbProvider.select({
      total: count(),
    })
      .from(weeklyProofTable)
      .where(
        and(
          eq(weeklyProofTable.campaignId, campaignId),
          eq(weeklyProofTable.userId, userId),
          eq(weeklyProofTable.statusType, WeeklyProofStatus.APPROVED),
        ),
      );

    return weeklyProofs;
  }

  async getProofCountsByDriverCampaigns(
    driverCampaigns: { id: string; campaignId: string; userId: string }[],
  ): Promise<Map<string, number>> {
    if (!driverCampaigns.length) return new Map();

    const results = await this.DbProvider.select({
      campaignId: weeklyProofTable.campaignId,
      userId: weeklyProofTable.userId,
      total: count(),
    })
      .from(weeklyProofTable)
      .where(
        and(
          inArray(
            weeklyProofTable.campaignId,
            driverCampaigns.map((d) => d.campaignId),
          ),
          inArray(
            weeklyProofTable.userId,
            driverCampaigns.map((d) => d.userId),
          ),
          eq(weeklyProofTable.statusType, WeeklyProofStatus.APPROVED),
        ),
      )
      .groupBy(weeklyProofTable.campaignId, weeklyProofTable.userId);

    const countMap = new Map<string, number>();

    for (const result of results) {
      const match = driverCampaigns.find(
        (d) => d.campaignId === result.campaignId && d.userId === result.userId,
      );
      if (match) {
        countMap.set(match.id, result.total);
      }
    }

    return countMap;
  }
}
