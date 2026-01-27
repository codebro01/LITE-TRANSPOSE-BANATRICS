import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePaymentDto } from '@src/payment/dto/createPaymentDto';
import {
  businessOwnerTable,
  campaignTable,
  PaymentStatusType,
  paymentTable,
  userTable,
} from '@src/db';
import crypto from 'crypto';
import { eq, and, sql, gte, lt } from 'drizzle-orm';
import { CampaignRepository } from '@src/campaign/repository/campaign.repository';
import { CatchErrorService } from '@src/catch-error/catch-error.service';
import { CategoryType, StatusType, VariantType } from '@src/notification/dto/createNotificationDto';
import { NotificationRepository } from '@src/notification/repository/notification.repository';


export const generateSecureInvoiceId = () => {
  const randomHex = crypto.randomUUID().substring(0, 8);
  return `INV-${randomHex}`;
};
export const generateSecureRef = () => {
  const randomAlphanumeric = crypto
    .randomUUID()
    .replace(/-/g, '')
    .substring(0, 8)
    .toUpperCase();
  return `BNT-${Date.now()}-${randomAlphanumeric}`;
};

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject('DB') private DbProvider: NodePgDatabase<typeof import('@src/db')>,
    private campaignRepository: CampaignRepository,
    private catchErrorService: CatchErrorService,
    private notificationRepository: NotificationRepository,
  ) {}

  // ! Transaction wrapper
   async executeInTransaction<T>(
    callback: (trx: any) => Promise<T>,
  ): Promise<T> {
    return await this.DbProvider.transaction(async (trx) => {
      return await callback(trx);
    });
  }

  async savePayment(
    data: CreatePaymentDto & {
      paymentMethod: string;
      paymentStatus: PaymentStatusType;
      reference: string;
      transactionType: string;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const [payment] = await DbTrx.insert(paymentTable)
      .values({ userId, ...data })
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }
  async updatePaymentStatus(
    data: {
      reference: string;
      status: PaymentStatusType;
    },
    userId: string,
    trx?: typeof this.DbProvider,
  ) {
    const DbTrx = trx || this.DbProvider;
    const { reference, status } = data;
    const [payment] = await DbTrx.update(paymentTable)
      .set({ paymentStatus: status })
      .where(
        and(
          eq(paymentTable.reference, reference),
          eq(paymentTable.userId, userId),
        ),
      )
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, saving payment',
      );

    return { message: 'success', data: payment };
  }
  async updateBalance(
    data: {
      amount: number;
    },
    userId: string,
    trx?: any,
  ) {
    const DbTrx = trx || this.DbProvider;

    const { amount } = data;
    const [payment] = await DbTrx.update(businessOwnerTable)
      .set({ balance: sql`${businessOwnerTable.balance} + ${amount}` })
      .where(and(eq(businessOwnerTable.userId, userId)))
      .returning();

    if (!payment)
      throw new InternalServerErrorException(
        'An error occured, updating payment',
      );

    return { message: 'success', data: payment };
  }

  async getPayments(userId: string) {
    const payments = await this.DbProvider.select()
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!payments) {
      throw new InternalServerErrorException(
        'An error occured fetching payments',
      );
    }

    return { message: 'succcess', payments };
  }

  async getBalance(userId: string) {
    try {
      const [balance] = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));
      return balance;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async moveMoneyFromBalanceToPending(
    data: {
      campaignId: string;
    },
    userId: string,
  ) {
    try {
      const { campaignId } = data;
      // console.log(campaignId, amount);

      // ! Perform money move transactions
      const Trx = await this.executeInTransaction(async (trx) => {
        // ! get campaign amount from db

        const [getAmount] = await trx
          .select({ amount: campaignTable.price })
          .from(campaignTable)
          .where(
            and(
              eq(campaignTable.userId, userId),
              eq(campaignTable.id, campaignId),
            ),
          );

        const amount = getAmount.amount;

        // ! check balanace before performing performing money move trx to prevent negative value on balance

        const [businessOwner] = await trx
          .select({
            balance: businessOwnerTable.balance,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        if (!businessOwner) {
          throw new NotFoundException('Business owner not found');
        }

        if (Number(businessOwner.balance) < amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${businessOwner.balance.toFixed(2)}, Required: ${amount}`,
          );
        }

        await trx
          .update(businessOwnerTable)
          .set({
            balance: sql`${businessOwnerTable.balance} - ${amount}`,
            pending: sql`${businessOwnerTable.pending} + ${amount}`,
          })
          .where(eq(businessOwnerTable.userId, userId));

        const updateCampaignResult = await trx
          .update(campaignTable)
          .set({ paymentStatus: 'pending' })
          .where(
            and(
              eq(campaignTable.id, campaignId),
              eq(campaignTable.userId, userId),
              eq(campaignTable.statusType, 'pending'),
            ),
          )
          .returning();

        if (updateCampaignResult.length === 0) {
          throw new Error(
            'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
          );
        }

        const [currentData] = await trx
          .select({
            balance: businessOwnerTable.balance,
            pending: businessOwnerTable.pending,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        return {
          currentData: {
            balance: currentData?.balance.toFixed(2),
            pending: currentData?.pending.toFixed(2),
          },
          updateCampaignResult,
        };
      });
      // console.log(
      //   'updateCampaignResult',
      //   Trx.updateCampaignResult,
      //   Trx.currentData,
      // );
      if (
        !Trx.currentData ||
        !Trx.currentData.pending ||
        !Trx.currentData.balance
      )
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );
      return {
        currentBalance: Trx.currentData.balance,
        currentPending: Trx.currentData.pending,
      };
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  }
  async moveMoneyFromPendingToTotalAmountSpent(
    data: {
      campaignId: string;
    },
    userId: string,
  ) {
    try {
      const { campaignId } = data;

      const Trx = await this.executeInTransaction(async (trx) => {
    
        const [getAmount] = await trx
          .select({ amount: campaignTable.price })
          .from(campaignTable)
          .where(
            and(
              eq(campaignTable.userId, userId),
              eq(campaignTable.id, campaignId),
            ),
          );

        const amount = getAmount.amount;

        const [businessOwner] = await trx
          .select({
            balance: businessOwnerTable.pending,
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        if (!businessOwner) {
          throw new NotFoundException('Business owner not found');
        }

        if (Number(businessOwner.pending) < amount) {
          throw new BadRequestException(
            `Insufficient pending balance. Available: ${businessOwner.pending.toFixed(2)}, Required: ${amount}`,
          );
        }

        await trx
          .update(businessOwnerTable)
          .set({
            pending: sql`${businessOwnerTable.pending} - ${amount}`,
            // moneySpent: sql`${businessOwnerTable.moneySpent} + ${amount}`,
          })
          .where(eq(businessOwnerTable.userId, userId));

        const updateCampaignResult = await trx
          .update(campaignTable)
          .set({
            paymentStatus: 'spent',
            statusType: 'completed',
            spentAt: new Date(),
          })
          .where(
            and(
              eq(campaignTable.id, campaignId),
              eq(campaignTable.userId, userId),
              eq(campaignTable.statusType, 'pending'),
              eq(campaignTable.paymentStatus, 'pending'),
            ),
          )
          .returning();


            await this.notificationRepository.createNotification(
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
              trx
            );

        // console.log('updateCampaignResult', updateCampaignResult);

        if (updateCampaignResult.length === 0) {
          throw new Error(
            'Campaign not found or not in pending status. Only campaigns with status "pending" can be paid for.',
          );
        }

        const [currentData] = await trx
          .select({
            pending: businessOwnerTable.pending,
            balance: businessOwnerTable.balance,
            
          })
          .from(businessOwnerTable)
          .where(eq(businessOwnerTable.userId, userId));

        return { currentData 

        };
      });
      // console.log('currentData', Trx.currentData);
      if (
        !Trx.currentData ||
        !Trx.currentData.pending ||
        !Trx.currentData.balance
      )
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );

        
    
      return {
        currentBalance: Trx.currentData.balance.toFixed(2),
        currentPending: Trx.currentData.pending.toFixed(2),
      };
    } catch (error) {
      // console.log(error);
      throw new Error(error);
    }
  }

  async findByReference(reference: string) {
    const [payment] = await this.DbProvider.select()
      .from(paymentTable)
      .where(eq(paymentTable.reference, reference))
      .limit(1);

    return payment;
  }

  async listTransactions(userId: string) {
    try {
      const transactions = await this.DbProvider.select({
        invoiceId: paymentTable.invoiceId,
        amount: paymentTable.amount,
        paymentMethod: paymentTable.paymentMethod,
        status: paymentTable.paymentStatus,
      })
        .from(paymentTable)
        .where(eq(paymentTable.userId, userId));
      // if(!transactions) throw new NotFoundException('Transactions could not be fetched')
      return transactions;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async paymentDashboard(userId: string) {
    try {
      const allTimeDashboardData = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
        pending: businessOwnerTable.pending,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));

      // ! get monthly spendings

      const year = new Date().getFullYear();
      const month = new Date().getMonth();

      const startOfMonth = new Date(year, month, 1); // month is 0-indexed
      const startOfNextMonth = new Date(year, month + 1, 1);

      const getTotalSpent = await this.DbProvider.select({
        totalSpent: sql<number>`SUM(${campaignTable.price})`,
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.userId, userId),
            eq(campaignTable.paymentStatus, 'spent'),
          ),
        );


              const totalSpent = getTotalSpent[0]?.totalSpent || 0;

      const getTotalSpentThisMonth = await this.DbProvider.select({
        totalSpent: sql<number>`SUM(${campaignTable.price})`,
      })
        .from(campaignTable)
        .where(
          and(
            eq(campaignTable.userId, userId),
            eq(campaignTable.paymentStatus, 'spent'),
            gte(campaignTable.spentAt, startOfMonth),
            lt(campaignTable.spentAt, startOfNextMonth),
          ),
        );

      const totalSpentThisMonth = getTotalSpentThisMonth[0]?.totalSpent || 0;

      return {
        ...allTimeDashboardData[0],
        totalSpentThisMonth,
        totalSpent,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
