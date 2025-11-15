import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  generateSecureInvoiceId,
  generateSecureRef,
  PaymentRepository,
} from '@src/payment/repository/payment.repository';
import { UserRepository } from '@src/users/repository/user.repository';
import crypto from 'crypto';
import { InitializePaymentDto } from '@src/payment/dto/initializePaymentDto';
import { MakePaymentForCampaignDto } from '@src/payment/dto/makePaymentForCampaignDto';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CatchErrorService } from '@src/catch-error/catch-error.service';

// interface InitializePaymentDto {
//   email: string;
//   amount: number; // in kobo (NGN) or smallest currency unit
//   reference?: string;
//   callback_url?: string;
//   metadata?: Record<string, any>;
//   invoiceNumber?: string;
// }

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

@Injectable()
export class PaymentService {
  private readonly baseUrl: string = 'https://api.paystack.co';
  private readonly secretKey: string;
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private userRepository: UserRepository,
    private paymentRepository: PaymentRepository,
    private campaignRepository: CampaignRepository,
    private catchErrorService: CatchErrorService,
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

  async initializePayment(data: InitializePaymentDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            email: data.email,
            amount: data.amount,
            reference: generateSecureRef(),
            callback_url: data.callback_url,
            metadata: {
              ...data.metadata,
              invoiceId: generateSecureInvoiceId(),
              dateInitiated: new Date().toISOString(),
            },
          },
          { headers: this.getHeaders() },
        ),
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response?.data?.message || 'Failed to initialize payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! verify payments

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/transaction/verify/${reference}`,
          { headers: this.getHeaders() },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to verify payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! verify webhook signatures

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  //! admin get transaction details

  async getTransaction(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction/${id}`, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to get transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! admin list all transactions details

  async listAllTransactions(params?: { perPage?: number; page?: number }) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction`, {
          headers: this.getHeaders(),
          params: {
            perPage: params?.perPage || 50,
            page: params?.page || 1,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to list transactions',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async makePaymentForCampaign(
    data: MakePaymentForCampaignDto,
    userId: string,
  ) {
    const { campaignId } = data;
    try {
      const result = await this.paymentRepository.moveMoneyFromBalanceToPending(
        { campaignId },
        userId,
      );


      return result;
    } catch (error) {
      console.error('error', error.message);
      throw new HttpException(
        error.response?.data?.message ||
          error?.message ||
          'Failed to list transactions',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async finalizePaymentForCampaign(
    data: MakePaymentForCampaignDto,
    userId: string,
  ) {
    const { campaignId } = data;
    try {
      const result =
        await this.paymentRepository.moveMoneyFromPendingToTotalAmountSpent(
          { campaignId },
          userId,
        );

      return result;
    } catch (error) {
      console.error('error', error.message);
      throw new HttpException(
        error.response?.data?.message ||
          error?.message ||
          'Failed to list transactions',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async listTransactions(userId: string) {
    try {
      const result = await this.paymentRepository.listTransactions(userId);

      return result;
    } catch (error) {
      console.error('error', error.message);
      this.catchErrorService.catch(
        error,
        'An error occured listing transactions',
      );
    }
  }
  async paymentDashboard(userId: string) {
    try {
      const result = await this.paymentRepository.paymentDashboard(userId);
      return result;
    } catch (error) {
      console.error('error', error.message);
      this.catchErrorService.catch(
        error,
        'An error occured could not load dasboard data',
      );
    }
  }
}
