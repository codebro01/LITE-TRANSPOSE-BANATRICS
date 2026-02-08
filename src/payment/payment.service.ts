import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  HttpStatus,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
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
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';
import { NotificationService } from '@src/notification/notification.service';
import { EarningRepository } from '@src/earning/repository/earning.repository';
import { PaymentStatusType } from '@src/db';
import { CronExpression, Cron } from '@nestjs/schedule';

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

  async initializePayment(
    data: InitializePaymentDto & {
      email: string;
      userId: string;
      role: string;
    },
  ) {
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
              amountInNaira: data.amount / 100,
              userId: data.userId,
              invoiceId: generateSecureInvoiceId(),
              dateInitiated: new Date().toISOString(),
              role: data.role,
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
      const { userId, amountInNaira, invoiceId, dateInitiated } =
        event.data.metadata || {};
      // console.log('got in here', event);
      const recipient_code = event.data?.recipient?.recipient_code || null;
      // const {account_number, account_name, bank_name, bank_code} = event.data.recipient.details

      switch (event.event) {
        case 'charge.success': {
          const existingPayment =
            await this.paymentRepository.findByReference(reference);

          if (
            existingPayment &&
            existingPayment.paymentStatus === PaymentStatusType.SUCCESS
          ) {
            return 'already processed';
          }

          console.log('got in here');

          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: PaymentStatusType.SUCCESS,
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
            'businessOwner',
          );

          break;
        }
        case 'charge.failed': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: PaymentStatusType.FAILED,
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
            'businessOwner',
          );
          break;
        }

        case 'charge.pending': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.savePayment(
              {
                amount: amountInNaira,
                invoiceId,
                dateInitiated,
                paymentStatus: PaymentStatusType.PENDING,
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
            'businessOwner',
          );
          break;
        }

        case 'refund.processed': {
          await this.paymentRepository.executeInTransaction(async (trx) => {
            await this.paymentRepository.updatePaymentStatus(
              { reference, status: PaymentStatusType.REVERSED },
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
            'businessOwner',
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
                paymentStatus: PaymentStatusType.SUCCESS,
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
            'driver',
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
                paymentStatus: PaymentStatusType.FAILED,
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
            'driver',
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
                paymentStatus: PaymentStatusType.REVERSED,
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
            'driver',
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
    data: {
      campaignId: string;
    },
    userId: string,
    trx?: any,
  ) {
    const { campaignId } = data;
    // console.log(campaignId, amount);

    // ! Perform money move transactions
    // ! get campaign amount from db

    const getAmount = await this.paymentRepository.getCampaignPrice(
      campaignId,
      userId,
      trx,
    );

    const amount = getAmount.amount;

    const businessOwner =
      await this.paymentRepository.getBusinessOwnerBalanceAndPending(
        userId,
        trx,
      );

    if (!businessOwner) {
      throw new NotFoundException('Business owner not found');
    }

    const updateBalanceAndPending =
      await this.paymentRepository.updateBalanceAndPending(userId, amount, trx);

    if (!updateBalanceAndPending)
      throw new BadRequestException(
        `Insufficient balance. Required: ${amount}`,
      );

    const updateCampaignStatus =
      await this.paymentRepository.updateCampaignStatus(
        campaignId,
        'pending',
        userId,
        true,
        trx,
      );

    if (!updateCampaignStatus) {
      throw new InternalServerErrorException(
        'Could not make payment for Campaign',
      );
    }

    return {
      currentData: {
        balance: updateBalanceAndPending.balance,
        pending: updateBalanceAndPending.pending,
      },
      updateCampaignStatus,
    };
  }

  // ! This functions handles the deduction of money from pending (The state at which the capaign is still active) to total Amount spent (When the campaign is completed, its going to be a cron job)

  @Cron(CronExpression.EVERY_12_HOURS)
  async deductFromPendingToTotalAmountSpent(
    data: {
      campaignId: string;
    },
    userId: string,
  ) {
    try {
      const { campaignId } = data;

      const Trx = await this.paymentRepository.executeInTransaction(
        async (trx) => {
          const getAmount = await this.paymentRepository.getCampaignPrice(
            campaignId,
            userId,
            trx,
          );

          const amount = getAmount.amount;

          const businessOwner =
            await this.paymentRepository.getBusinessOwnerBalanceAndPending(
              userId,
              trx,
            );

          if (!businessOwner) {
            throw new NotFoundException('Business owner not found');
          }

          if (Number(businessOwner.pending) < amount) {
            throw new BadRequestException(
              `Insufficient pending balance. Available: ${businessOwner.pending.toFixed(2)}, Required: ${amount}`,
            );
          }

          const updatePendingAndTotalSpent =
            await this.paymentRepository.updatePendingAndTotalSpent(
              userId,
              amount,
              trx,
            );

          const updateCampaignStatus =
            await this.paymentRepository.updateCampaignStatus(
              campaignId,
              'completed',
              userId,
              undefined,
              trx,
            );

          await this.notificationService.createNotification(
            {
              title: `Campaign charge`,
              message: `${amount} has been successfully dedecuted to settle the campaign charge`,
              variant: VariantType.SUCCESS,
              category: CategoryType.CAMPAIGN,
              priority: '',
              status: StatusType.UNREAD,
            },
            userId,
            'businessOwner',
          );

          // console.log('updateCampaignResult', updateCampaignResult);

          if (!updateCampaignStatus) {
            throw new Error(
              'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
            );
          }

          const currentData = {
            pending: updatePendingAndTotalSpent.pending,
            totalSpent: updatePendingAndTotalSpent.totalSpent,
          };

          return { currentData };
        },
      );
      // console.log('currentData', Trx.currentData);
      if (
        !Trx.currentData ||
        !Trx.currentData.pending ||
        !Trx.currentData.totalSpent
      )
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );

      return {
        totalSpent: Trx.currentData.totalSpent.toFixed(2),
        currentPending: Trx.currentData.pending.toFixed(2),
      };
    } catch (error) {
      // console.log(error);
      throw new Error(error);
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
