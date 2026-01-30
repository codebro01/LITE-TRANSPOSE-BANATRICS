import { Inject, Injectable } from '@nestjs/common';
import { installmentProofTable } from '@src/db';
import { CreateInstallmentProofDto } from '@src/installment-proofs/dto/create-installment-proof.dto';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class InstallmentProofRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async getCampaignInstallmentProof(campaignId: string, userId: string) {


    const [installmentProof] = await this.DbProvider.select()
      .from(installmentProofTable)
      .where(
        and(
          eq(installmentProofTable.userId, userId),
          eq(installmentProofTable.campaignId, campaignId),
        ),
      ).limit(1);
    return installmentProof;
  }

  async createInstallmentProof(data:CreateInstallmentProofDto , campaignId: string, userId: string) {
      const installmentProof = await this.DbProvider.insert(
        installmentProofTable,
      )
        .values({...data, campaignId, userId})
        .returning();

        return installmentProof;
  }


  async updateInstallmentProof(data:CreateInstallmentProofDto , campaignId: string, userId: string) {
      const installmentProof = await this.DbProvider.update(
        installmentProofTable,
      )
        .set({ ...data })
        .where(
          and(
            eq(installmentProofTable.campaignId, campaignId),
            eq(installmentProofTable.userId, userId),
          ),
        )
        .returning();

        return installmentProof;
  }

  async getApprovedInstallmentProof(campaignId: string, userId: string) {
      const [installmentProof] = await this.DbProvider.select({
        status: installmentProofTable.statusType, 
      })
        .from(installmentProofTable)
        .where(
          and(
            eq(installmentProofTable.userId, userId),
            eq(installmentProofTable.campaignId, campaignId),
            eq(installmentProofTable.statusType, 'approved'),
          ),
        )
        .limit(1);

        return installmentProof
  }
}
