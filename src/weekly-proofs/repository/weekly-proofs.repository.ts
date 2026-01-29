import { Injectable, Inject } from '@nestjs/common';
import { campaignTable, weeklyProofInsertType, weeklyProofTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql} from 'drizzle-orm';

@Injectable()
export class WeeklyProofsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(
    data: Omit<weeklyProofInsertType, 'userId'>,
    userId: string,
  ) {



    const [weeklyProof] = await this.DbProvider.insert(weeklyProofTable).values({
      ...data,
      userId,
    }).returning();

    return weeklyProof;
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
      })
      .where(
        and(
          eq(weeklyProofTable.id, weeklyProofId),
          eq(weeklyProofTable.userId, userId),
        ),
      ).returning();

    return weeklyProof;
  }

  remove(userId: string) {
    return `This action removes a #${userId} weeklyProof`;
  }
}
