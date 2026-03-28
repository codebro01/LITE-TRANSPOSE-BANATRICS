import { HttpService } from '@nestjs/axios';
import { Injectable, BadRequestException } from '@nestjs/common';
// import { CreateEarningDto } from './dto/create-earning.dto';
// import { UpdateEarningDto } from './dto/update-earning.dto';
import { ConfigService } from '@nestjs/config';
import { BankDetailsRepository } from '@src/bank-details/repository/bank-details-repository';
import { CreateTransferRecipientDto } from '@src/earning/dto/create-transfer-recipients.dto';
import { VerifyBankDetailsDto } from '@src/bank-details/dto/verify-bank-details.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BankDetailsService {
  private readonly baseUrl: string = 'https://api.flutterwave.com';
  private readonly secretKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly bankDetailsRepository: BankDetailsRepository,
  ) {
    const key = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    if (!key) {
      throw new BadRequestException('Please provide flutterwave secret Key');
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

  async verifyBankDetails(data: Omit<VerifyBankDetailsDto, 'bankName'>) {
    // console.log('url before resp',
    //   `${this.baseUrl}/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`,
    // );
    const response: any = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}v3/accounts/resolve`,
        {
          account_number: data.accountNumber,
          account_bank: data.bankCode,
        },
        {
          headers: this.getHeaders(),
        },
      ),
    );
    if (!response)
      throw new BadRequestException('could not resolve account information!!!');

    return response;
  }

  async getBanks() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/banks/NG`, {
        headers: this.getHeaders(),
      }),
    );
    return response.data.data; // array of { id, code, name }
  }

  async findOneById(userId: string) {
    return await this.bankDetailsRepository.findOneById(userId);
  }

  async createTransferRecipients(data: CreateTransferRecipientDto) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v3/beneficiaries`,
        {
          beneficiary_name: data.accountName,
          account_number: data.accountNumber,
          account_bank: data.bankCode,
          currency: 'NGN',
          bank_name: data.bankName,
        },
        {
          headers: this.getHeaders(),
        },
      ),
    );

    return response;
  }

  async saveUserBankInformation(data: VerifyBankDetailsDto, userId: string) {
    const [getVerifiedBankDetails, banks] = await Promise.all([

      this.verifyBankDetails({
        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
      }), 
      this.getBanks()
    ]) 
    if (getVerifiedBankDetails.status !== 'success')
      throw new BadRequestException(
        'Could not fetch account information using data provided',
      );

    //   console.log(getVerifiedBankDetails.data)

    const { account_number, account_name } = getVerifiedBankDetails.data;
      const bankName = banks.find((b: any) => b.code === data.bankCode);

    const createTransferRecipients = await this.createTransferRecipients({
      accountName: account_name,
      accountNumber: account_number,
      bankCode: data.bankCode,
      bankName: bankName,
    });

    const {
      account_number: accNumber,
      bank_code: bnkCode,
      bank_name,
    } = createTransferRecipients.data.data.details;

    // console.log(
    //   accNumber,
    //   accountName,
    //   bnkCode,
    //   createTransferRecipients.data.data.recipient_code,
    // );
    // console.log(

    //   createTransferRecipients.data.data,
    // );
    const saveBankRecords =
      await this.bankDetailsRepository.createBankDetailsRecord(
        {
          userId,
          bankName: bank_name,
          accountName: createTransferRecipients.data.data.name,
          accountNumber: accNumber,
          bankCode: bnkCode,
          recipientCode: createTransferRecipients.data.data.recipient_code,
        },
        userId,
      );

    return saveBankRecords;
  }
}
