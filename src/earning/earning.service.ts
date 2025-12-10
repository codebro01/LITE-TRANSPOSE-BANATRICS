import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
// import { CreateEarningDto } from './dto/create-earning.dto';
// import { UpdateEarningDto } from './dto/update-earning.dto';
import { ConfigService } from '@nestjs/config';
import { BankDetailsRepository } from '@src/bank-details/repository/create-bank-details-repository';
import { InitializeEarningDto } from '@src/earning/dto/initialize-earning.dto';
import { generateSecureRef } from '@src/payment/repository/payment.repository';
import { firstValueFrom } from 'rxjs';
import { CreateEarningDto } from '@src/earning/dto/create-earning.dto';
import { EarningRepository } from '@src/earning/repository/earning.repository';

@Injectable()
export class EarningService {
  private readonly baseUrl: string = 'https://api.paystack.co';
  private readonly secretKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly bankDetailsRepository: BankDetailsRepository,
    private readonly earningRepository: EarningRepository,
  ) {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!key) {
      throw new BadRequestException('Please provide paystack secretKey');
    }
    this.secretKey = key;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  // * admin section
  async initializePayout(data: InitializeEarningDto) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          recipient: data.recipient,
          amount: data.amount,
          reason: data.reason,
          reference: generateSecureRef(),
        },
        { headers: this.getHeaders() },
      ),
    );

    return response.data;
  }

  async requestPayouts(data: CreateEarningDto, userId: string) {
    const isPendingPayout =
      await this.earningRepository.findEarningsByApproved(userId);
    if (isPendingPayout.length > 0)
      throw new BadRequestException(
        'You already have a pending payout, please kindly wait while we clear that one before applying for another payout!!!',
      );
    const balance = await this.earningRepository.availableBalance(userId);

    if (data.amount < balance)
      throw new BadRequestException('Insufficient fund');

    const earnings = await this.earningRepository.requestPayouts(data, userId);

    return earnings;
  }

  async updateEarningApprovedStatus(approved: boolean, userId: string) {
    const earning = await this.earningRepository.updateEarningApprovedStatus(
      approved,
      userId,
    );

    return earning;
  }

async listAllUnapprovedEarnings() {
    const earning =
      await this.earningRepository.getAllUnapprovedEarnings();

    return earning;
  }
  async listAllTransactions(userId: string) {
    const earning = await this.earningRepository.listAllTransactions(userId);

    return earning;
  }

  async earningDashboard(userId: string) {
    const [
      getTotalEarnings,
      availableBalance,
      pendingBalance,
      amountMadeThisMonth,
    ] = await Promise.all([
      this.earningRepository.getTotalEarnings(userId),
      this.earningRepository.availableBalance(userId),
      this.earningRepository.pendingBalance(userId),
      this.earningRepository.amountMadeThisMonth(userId),
    ]);

    return {
      getTotalEarnings,
      availableBalance,
      pendingBalance,
      amountMadeThisMonth,
    };
  }

  async monthlyEarningBreakdown(userId: string) {
    const earnings = await this.earningRepository.monthlyEarningBreakdown(userId);
    return earnings;
  }
}
