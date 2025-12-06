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
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
import { NotificationService } from '@src/notification/notification.service';
import { EarningRepository } from '@src/earning/repository/earning.repository';
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
    private notificationService: NotificationService,
    private earningRepository: EarningRepository,
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

  // ! handle post verify webhooks

  async postVerifyWebhookSignatures(event: any) {
    try {
      const { reference, createdAt, amount } = event.data;
      const { channel } = event.data.authorization || {};
      const { campaignName, userId, amountInNaira, invoiceId, dateInitiated } =
        event.data.metadata || {};
      const { recipient_code } = event.data.recipient;
      // const {account_number, account_name, bank_name, bank_code} = event.data.recipient.details

      switch (event.event) {
        case 'charge.success': {
          const existingPayment =
            await this.paymentRepository.findByReference(reference);

          if (existingPayment && existingPayment.paymentStatus === 'success') {
            return 'already processed';
          }

          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                campaignName,
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: 'success',
                paymentMethod: channel,
                reference,
                transactionType: 'deposit',
              },
              userId,
              trx,
            );

            await this.paymentRepository.updateBalance(
              { amount: amountInNaira },
              userId,
              trx,
            );
          });

          await this.notificationService.createNotification(
            {
              title: `Your deposit of ${amountInNaira} is successfull`,
              message: `You have successfully deposited ${amountInNaira} through ${channel} `,
              variant: VariantType.SUCCESS,
              category: CategoryType.PAYMENT,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
          );

          break;
        }
        case 'charge.failed': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                campaignName,
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: 'failed',
                paymentMethod: channel,
                reference,
                transactionType: 'deposit',
              },
              userId,
              trx,
            );
          });

          await this.notificationService.createNotification(
            {
              title: `Your deposit of ${amountInNaira}  failed`,
              message: `Your deposited of ${amountInNaira} through ${channel} may have failed due to some reasons, please try again `,
              variant: VariantType.DANGER,
              category: CategoryType.PAYMENT,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
          );
          break;
        }

        case 'charge.pending': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                campaignName,
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: 'pending',
                paymentMethod: channel,
                reference,
                transactionType: 'deposit',
              },
              userId,
              trx,
            );
          });

          await this.notificationService.createNotification(
            {
              title: `Your deposit of ${amountInNaira} is pending`,
              message: `Your deposited of ${amountInNaira} through ${channel} is still pending, please kindly wait while the payment for the payment to be comfirmed `,
              variant: VariantType.INFO,
              category: CategoryType.PAYMENT,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
          );
          break;
        }

        case 'refund.processed': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.updatePaymentStatus(
              { reference, status: 'refunded' },
              userId,
              trx,
            );

            await this.paymentRepository.updateBalance(
              { amount: -amountInNaira },
              userId,
              trx,
            );
          });

          await this.notificationService.createNotification(
            {
              title: `Refund of ${amountInNaira} is proccessing`,
              message: `Your refund of ${amountInNaira} is processing, please wait while it completes `,
              variant: VariantType.INFO,
              category: CategoryType.PAYMENT,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
          );

          break;
        }

        case 'transfer.success': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.earningRepository.createEarnings(
              {
                amount: amount,
                reference,
                dateInitiated: createdAt,
                recipientCode: recipient_code,
                paymentStatus: 'success',
                paymentMethod: 'transfer',
              },
              trx,
            );
          });
          await this.notificationService.createNotification(
            {
              title: `Your withdrawal of ${amount} is successful`,
              message: `Kindly wait a few seconds to receive the funds in your connected bank.`,
              variant: VariantType.INFO,
              category: CategoryType.PAYMENT,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
          );

          break;
        }
        case 'transfer.failed': {

             await this.paymentRepository.executeInTransaction(async (trx) => {
               await this.earningRepository.createEarnings(
                 {
                   amount: amount,
                   reference,
                   dateInitiated: createdAt,
                   recipientCode: recipient_code,
                   paymentStatus: 'failed',
                   paymentMethod: 'transfer',
                 },
                 trx,
               );
             });
             await this.notificationService.createNotification(
               {
                 title: `Your withdrawal of ${amount} is processing!!!`,
                 message: `Kindly wait some minutes while we proccess the withdrawal of your funds`,
                 variant: VariantType.SUCCESS,
                 category: CategoryType.PAYMENT,
                 priority: '',
                 status: StatusType.UNREAD,
               },
               userId,
             );
          break;
        }
        case 'transfer.reversed': {
             await this.paymentRepository.executeInTransaction(async (trx) => {
               await this.earningRepository.createEarnings(
                 {
                   amount: amount,
                   reference,
                   dateInitiated: createdAt,
                   recipientCode: recipient_code,
                   paymentStatus: 'reversed',
                   paymentMethod: 'transfer',
                 },
                 trx,
               );
             });
             await this.notificationService.createNotification(
               {
                 title: `Your withdrawal of ${amount} is been processed`,
                 message: `Kindly wait some minutes while  we process the withdrawal of your funds`,
                 variant: VariantType.INFO,
                 category: CategoryType.PAYMENT,
                 priority: '',
                 status: StatusType.UNREAD,
               },
               userId,
             );
          break;
        }

        default:
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { error: error.message };
    }
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
      throw new Error(error);
    }
  }
  async paymentDashboard(userId: string) {
    try {
      const result = await this.paymentRepository.paymentDashboard(userId);
      return result;
    } catch (error) {
      console.error('error', error.message);
      throw new Error(error);
    }
  }
}
