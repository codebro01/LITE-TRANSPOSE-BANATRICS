import {
  Inject,
  Injectable,
  InternalServerErrorException,
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
      .values({ userId, ...data, dateInitiated: data.dateInitiated ? new Date(data.dateInitiated) : new Date() })
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

  async getBusinessOwnerBalanceAndPending(userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [balance] = await Trx.select({
      balance: businessOwnerTable.balance,
      pending: businessOwnerTable.pending,
    })
      .from(businessOwnerTable)
      .where(eq(businessOwnerTable.userId, userId));
    return balance;
  }

  async getCampaignPrice(campaignId: string, userId: string, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [getAmount] = await Trx.select({ amount: campaignTable.price })
      .from(campaignTable)
      .where(
        and(eq(campaignTable.userId, userId), eq(campaignTable.id, campaignId)),
      );
    return getAmount;
  }

  async updateCampaignStatus(
    campaignId: string,
    status: string,
    userId: string,
    paymentStatus?: boolean,
    trx?: any,
  ) {
    const Trx = trx || this.DbProvider;
    const updateData: {
      paymentStatus?: boolean;
      statusType: string;
    } = { statusType: status };
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    const [updateCampaignStatus] = await Trx.update(campaignTable)
      .set(updateData)
      .where(
        and(eq(campaignTable.id, campaignId), eq(campaignTable.userId, userId)),
      )
      .returning({
        paymentStatus: campaignTable.paymentStatus,
      });

    return updateCampaignStatus;
  }

  async updateBalanceAndPending(userId: string, amount: number, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [update] = await Trx.update(businessOwnerTable)
      .set({
        balance: sql`${businessOwnerTable.balance} - ${amount}`,
        pending: sql`${businessOwnerTable.pending} + ${amount}`,
      })
      .where(eq(businessOwnerTable.userId, userId))
      .returning();

    return update;
  }
  async updatePendingAndTotalSpent(userId: string, amount: number, trx?: any) {
    const Trx = trx || this.DbProvider;
    const [update] = await Trx.update(businessOwnerTable)
      .set({
        pending: sql`${businessOwnerTable.balance} - ${amount}`,
        totalSpent: sql`${businessOwnerTable.totalSpent} + ${amount}`,
      })
      .where(eq(businessOwnerTable.userId, userId))
      .returning();

    return update;
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
            eq(campaignTable.paymentStatus, true),
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
            eq(campaignTable.paymentStatus, true),
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
