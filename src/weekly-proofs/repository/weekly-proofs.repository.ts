import { Injectable, Inject } from '@nestjs/common';
import { weeklyProofInsertType, weeklyProofTable } from '@src/db';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';

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
    const weeklyProof = await this.DbProvider.select()
      .from(weeklyProofTable)
      .where(eq(weeklyProofTable.userId, userId));

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
