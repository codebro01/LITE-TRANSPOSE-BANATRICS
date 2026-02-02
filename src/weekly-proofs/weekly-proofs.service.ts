import { Injectable, BadRequestException } from '@nestjs/common';
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
    const today = new Date().getDay();
    const allowedDays = [5, 6];

    if (!allowedDays.includes(today)) {
      throw new BadRequestException(
        'Weekly proofs can only be uploaded on Fridays and Saturdays',
      );
    }

    // Get current year, month, and week number
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1
    const currentWeek = this.getWeekNumber(now);

    // Check if user already submitted this week
    const existingSubmission = await this.weeklyProofsRepository.findByWeek(
      userId,
      data.campaignId,
      currentYear,
      currentWeek,
    );

    if (existingSubmission) {
      throw new BadRequestException(
        'You have already submitted a weekly proof for this weekend. ' +
          'Only one submission allowed per weekend (Friday-Saturday).',
      );
    }

    // Add week number, month, and year to data
    const dataWithWeek = {
      ...data,
      year: currentYear,
      month: currentMonth,
      weekNumber: currentWeek,
    };

    const approvedInstallmentProof =
      await this.installmentProofRepository.getApprovedInstallmentProof(
        data.campaignId,
        userId,
      );

    if (!approvedInstallmentProof)
      throw new BadRequestException(
        'Weekly proofs can be uploaded after installment proofs has been approved. Please make sure you have uploaded the installment proof',
      );

    const weeklyProof = await this.weeklyProofsRepository.create(dataWithWeek, userId);

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

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
