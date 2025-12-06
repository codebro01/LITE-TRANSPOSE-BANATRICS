import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
// import { CreateEarningDto } from './dto/create-earning.dto';
// import { UpdateEarningDto } from './dto/update-earning.dto';
import { ConfigService } from '@nestjs/config';
import { BankDetailsRepository } from '@src/bank-details/repository/create-bank-details-repository';
import { CreateTransferRecipientDto } from '@src/earning/dto/create-transfer-recipients.dto';
import { InitializeEarningDto } from '@src/earning/dto/initialize-earning.dto';
import { VerifyBankDetailsDto } from '@src/earning/dto/verify-bank-details.dto';
import { generateSecureRef } from '@src/payment/repository/payment.repository';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EarningService {
  private readonly baseUrl: string = 'https://api.paystack.co';
  private readonly secretKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly bankDetailsRepository: BankDetailsRepository,
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

  async initializeWithdrawal(data: InitializeEarningDto) {
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

  // * admin section

  async verifyBankDetails(data: VerifyBankDetailsDto) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.baseUrl}/bank/resolve?accountNumber=${data.accountNumber}&bank_code=${data.bankCode}`,
        { headers: this.getHeaders() },
      ),
    );

    return response;
  }

  async createTransferRecipients(data: CreateTransferRecipientDto) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name: data.accountName,
          account_number: data.accountNumber,
          bank_code: data.bankCode,
          currency: 'NGN',
        },
        {
          headers: this.getHeaders(),
        },
      ),
    );

    return response;
  }

  async saveUserBankInformation(data: VerifyBankDetailsDto, userId: string) {
    const getVerifiedBankDetails = await this.verifyBankDetails({
      accountNumber: data.accountNumber,
      bankCode: data.bankCode,
    });
    if (!getVerifiedBankDetails)
      throw new BadRequestException(
        'Could not pull account information using data provided',
      );
    const { account_number, account_name, bank_id } =
      getVerifiedBankDetails.data;
    const createTransferRecipients = await this.createTransferRecipients({
      accountName: account_name,
      accountNumber: account_number,
      bankCode: data.bankCode,
    });

    const {
      account_number: accNumber,
      name: accountName,
      bank_code: bnkCode,
    } = createTransferRecipients.data.details;

    const saveBankRecords =
      await this.bankDetailsRepository.createBankDetailsRecord(
        {
          userId,
          accountName: accountName,
          accountNumber: accNumber,
          bankCode: bnkCode,
          bankId: bank_id,
          recipientCode: createTransferRecipients.data.recipient_code,
        },
        userId,
      );

    return saveBankRecords;
  }
}
