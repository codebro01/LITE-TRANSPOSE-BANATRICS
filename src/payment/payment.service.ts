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
import { OneSignalService } from '@src/one-signal/one-signal.service';

// import { CronExpression, Cron } from '@nestjs/schedule';

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
  private readonly baseUrl: string = 'https://api.flutterwave.com';
  private readonly secretKey: string;
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private userRepository: UserRepository,
    private paymentRepository: PaymentRepository,
    private campaignRepository: CampaignRepository,
    private notificationService: NotificationService,
    private earningRepository: EarningRepository,
    private oneSignalService: OneSignalService,
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
          `${this.baseUrl}/v3/payments`,
          {
            amount: String(data.amount),
            tx_ref: generateSecureRef(),
            currency: 'NGN',
            redirect_url:
              data.callback_url ||
              'https://banatrics-service-5gybv.ondigitalocean.app/api/v1/payments/callback-test',
            customer: {
              email: data.email,
            },
            meta: {
              amountInNaira: data.amount,
              userId: data.userId,
              invoiceId: generateSecureInvoiceId(),
              dateInitiated: new Date().toISOString(),
              role: data.role,
            },
          },
          { headers: this.getHeaders() },
        ),
      );
      console.log(JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error: any) {
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
          `${this.baseUrl}/v3/transactions/${reference}/verify`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to verify payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! verify webhook signatures

  verifyWebhookSignature(signature: string): boolean {
    const secret = this.configService.get('FLUTTERWAVE_WEBHOOK_SECRET');
    return signature === secret;
  }

  // ! handle post verify webhooks

  async postVerifyWebhookSignatures(event: any) {
    try {
      const { tx_ref, payment_type, status } = event.data;
      const { channel } = event.data.authorization || {};
      const { userId, amountInNaira, invoiceId, dateInitiated } =
        event.meta_data || {};
      console.log('got in event', event);
      // const recipient_code = event.data?.recipient?.recipient_code || null;
      // const {account_number, account_name, bank_name, bank_code} = event.data.recipient.details
      switch (event.event) {
        case 'charge.completed': {
          const existingPayment =
            await this.paymentRepository.findByReference(tx_ref);

          if (
            existingPayment &&
            existingPayment.paymentStatus === PaymentStatusType.SUCCESS
          ) {
            return 'already processed';
          }

          console.log('got in here');
          if (status === 'successful') {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              if (
                existingPayment &&
                existingPayment.paymentStatus === PaymentStatusType.PENDING
              ) {
                await this.paymentRepository.updatePaymentStatus(
                  {
                    reference: tx_ref,
                    status: PaymentStatusType.SUCCESS,
                  },
                  userId,
                  trx,
                );
              } else {
                await this.paymentRepository.savePayment(
                  {
                    amount: amountInNaira,
                    invoiceId,
                    dateInitiated,
                    paymentStatus: PaymentStatusType.SUCCESS,
                    paymentMethod: payment_type,
                    reference: tx_ref,
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
              }
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
          } else if (status === 'failed') {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.savePayment(
                {
                  amount: amountInNaira,
                  invoiceId,
                  dateInitiated,
                  paymentStatus: PaymentStatusType.FAILED,
                  paymentMethod: payment_type,
                  reference: tx_ref,
                  transactionType: 'deposit',
                },
                userId,
                trx,
              );
            });

            await this.notificationService.createNotification(
              {
                title: `Transaction Failed`,
                message: `Your deposit of ${amountInNaira} failed`,
                variant: VariantType.DANGER,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              userId,
              'businessOwner',
            );
          } else if (status === 'pending') {
            await this.paymentRepository.executeInTransaction(async (trx) => {
              await this.paymentRepository.savePayment(
                {
                  amount: amountInNaira,
                  invoiceId,
                  dateInitiated,
                  paymentStatus: PaymentStatusType.PENDING,
                  paymentMethod: payment_type,
                  reference: tx_ref,
                  transactionType: 'deposit',
                },
                userId,
                trx,
              );

              // await this.paymentRepository.updateBalance(
              //   { amount: amountInNaira },
              //   userId,
              //   trx,
              // );
            });

            await this.notificationService.createNotification(
              {
                title: `Pending transaction`,
                message: `Your deposit of ${amountInNaira} is successfull`,
                variant: VariantType.WARNING,
                category: CategoryType.PAYMENT,
                priority: '',
                status: StatusType.UNREAD,
              },
              userId,
              'businessOwner',
            );
          }

          break;
        }

        // case 'refund.completed': {
        //   await this.paymentRepository.executeInTransaction(async (trx) => {
        //     await this.paymentRepository.updatePaymentStatus(
        //       { reference: tx_ref, status: PaymentStatusType.REVERSED },
        //       userId,
        //       trx,
        //     );

        //     await this.paymentRepository.updateBalance(
        //       { amount: -amountInNaira },
        //       userId,
        //       trx,
        //     );
        //   });

        //   await this.notificationService.createNotification(
        //     {
        //       title: `Reversed Transaction`,
        //       message: `Your refund of ${amountInNaira} is completed`,
        //       variant: VariantType.SUCCESS,
        //       category: CategoryType.PAYMENT,
        //       priority: '',
        //       status: StatusType.UNREAD,
        //     },
        //     userId,
        //     'businessOwner',
        //   );

        //   break;
        // }

        default:
      }

      return { status: 'success' };
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return { error: error.message };
    }
  }

  //! admin get transaction details

  async getTransaction(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${id}`, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || 'Failed to get transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //! admin list all transactions details
  async listAllTransactions(params?: {
    from?: string;
    to?: string;
    perPage?: number;
    page?: number;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions`, {
          headers: this.getHeaders(),
          params: {
            from: params?.from,
            to: params?.to,
            per_page: params?.perPage || 50,
            page: params?.page || 1,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
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
        new Date(),
        true,
        trx,
      );

    if (!updateCampaignStatus) {
      throw new InternalServerErrorException(
        'Could not make payment for Campaign',
      );
    }

    // await this.oneSignalService.sendNotificationToUser(
    //   campaign.,
    //   'Campaign Approved',
    //   `Your campaign with the title ${Trx.approveCampaign.campaignName} has been approved`,
    // );

    return {
      currentData: {
        balance: updateBalanceAndPending.balance,
        pending: updateBalanceAndPending.pending,
      },
      updateCampaignStatus,
    };
  }

  // // ! This functions handles the deduction of money from pending (The state at which the capaign is still active) to total Amount spent (When the campaign is completed, its going to be a cron job)

  // @Cron(CronExpression.EVERY_12_HOURS)
  // async deductFromPendingToTotalAmountSpent(
  //   data: {
  //     campaignId: string;
  //   },
  //   userId: string,
  // ) {
  //   try {
  //     const { campaignId } = data;

  //     const Trx = await this.paymentRepository.executeInTransaction(
  //       async (trx) => {
  //         const getAmount = await this.paymentRepository.getCampaignPrice(
  //           campaignId,
  //           userId,
  //           trx,
  //         );

  //         const amount = getAmount.amount;

  //         const businessOwner =
  //           await this.paymentRepository.getBusinessOwnerBalanceAndPending(
  //             userId,
  //             trx,
  //           );

  //         if (!businessOwner) {
  //           throw new NotFoundException('Business owner not found');
  //         }

  //         if (Number(businessOwner.pending) < amount) {
  //           throw new BadRequestException(
  //             `Insufficient pending balance. Available: ${businessOwner.pending.toFixed(2)}, Required: ${amount}`,
  //           );
  //         }

  //         const updatePendingAndTotalSpent =
  //           await this.paymentRepository.updatePendingAndTotalSpent(
  //             userId,
  //             amount,
  //             trx,
  //           );

  //         const updateCampaignStatus =
  //           await this.paymentRepository.updateCampaignStatus(
  //             campaignId,
  //             'completed',
  //             userId,
  //             undefined,
  //             undefined,
  //             trx,
  //           );

  //         await this.notificationService.createNotification(
  //           {
  //             title: `Campaign charge`,
  //             message: `${amount} has been successfully dedecuted to settle the campaign charge`,
  //             variant: VariantType.SUCCESS,
  //             category: CategoryType.CAMPAIGN,
  //             priority: '',
  //             status: StatusType.UNREAD,
  //           },
  //           userId,
  //           'businessOwner',
  //         );

  //         // console.log('updateCampaignResult', updateCampaignResult);

  //         if (!updateCampaignStatus) {
  //           throw new Error(
  //             'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
  //           );
  //         }

  //         const currentData = {
  //           pending: updatePendingAndTotalSpent.pending,
  //           totalSpent: updatePendingAndTotalSpent.totalSpent,
  //         };

  //         return { currentData };
  //       },
  //     );
  //     // console.log('currentData', Trx.currentData);
  //     if (
  //       !Trx.currentData ||
  //       !Trx.currentData.pending ||
  //       !Trx.currentData.totalSpent
  //     )
  //       throw new InternalServerErrorException(
  //         'An error occured fetching current payment data, please try again',
  //       );

  //     return {
  //       totalSpent: Trx.currentData.totalSpent.toFixed(2),
  //       currentPending: Trx.currentData.pending.toFixed(2),
  //     };
  //   } catch (error) {
  //     // console.log(error);
  //     throw new Error(error);
  //   }
  // }

  async listTransactions(userId: string) {
    try {
      const result = await this.paymentRepository.listTransactions(userId);

      return result;
    } catch (error: any) {
      console.error('error', error.message);
      throw new Error(error);
    }
  }
  async paymentDashboard(userId: string) {
    try {
      const result = await this.paymentRepository.paymentDashboard(userId);
      return result;
    } catch (error: any) {
      console.error('error', error.message);
      throw new Error(error);
    }
  }
}
