import { Injectable, BadRequestException, } from '@nestjs/common';
import { WeeklyProofsRepository } from '@src/weekly-proofs/repository/weekly-proofs.repository';
import { weeklyProofInsertType } from '@src/db';
import { InstallmentProofRepository } from '@src/installment-proofs/repository/installment-proofs.repository';

@Injectable()
export class WeeklyProofsService {
  constructor(
    private readonly weeklyProofsRepository: WeeklyProofsRepository,
    private readonly installmentProofRepository: InstallmentProofRepository,
  ) {}
  async create(data: Omit<weeklyProofInsertType, 'userId'>, userId: string) {
    const approvedInstallmentProof = await this.installmentProofRepository.getApprovedInstallmentProof(data.campaignId, userId);

    if(!approvedInstallmentProof) throw new BadRequestException('Weekly proofs can be uploaded after installment proofs has been approved. Please make sure you have uploaded the installment proof');
    const weeklyProof = await this.weeklyProofsRepository.create(data, userId);

    return weeklyProof;
  }

  async findAllByUserId(userId: string) {
    const weeklyProof =
      await this.weeklyProofsRepository.findAllByUserId(userId);
    return weeklyProof;
  }

  async findOneByUserId(weeklyProofId: string, userId: string) {
    const weeklyProof = await this.weeklyProofsRepository.findOneByUserId(
      weeklyProofId,
      userId,
    );

    return weeklyProof;
  }

  async update(
    data: Partial<Omit<weeklyProofInsertType, 'userId'>>,
    weeklyProofId: string,
    userId: string,
  ) {
    const weeklyProof = await this.weeklyProofsRepository.update(
      data,
      weeklyProofId,
      userId,
    );
    return weeklyProof;
  }

  remove(id: string) {
    return `This action removes a #${id} weeklyProof`;
  }
}
