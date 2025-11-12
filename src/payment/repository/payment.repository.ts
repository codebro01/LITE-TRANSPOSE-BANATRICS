import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePaymentDto } from '@src/payment/dto/createPaymentDto';
import { businessOwnerTable, paymentTable, userTable } from '@src/db';
import crypto from 'crypto';
import { eq, and, sql } from 'drizzle-orm';

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
      paymentStatus: string;
      reference: string;
      transactionType: string;
    },
    userId: string,
    trx,
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
      status: string;
    },
    userId: string,
    trx,
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

  async getPayments(userId) {
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

  async getBalance(userId) {
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
      amount: number;
    },
    userId: string,
  ) {
    try {
      const { amount } = data;
      await this.DbProvider.update(businessOwnerTable)
        .set({
          balance: sql`${businessOwnerTable.balance} - ${amount}`,
          pending: sql`${businessOwnerTable.pending} + ${amount}`,
        })
        .where(eq(businessOwnerTable.userId, userId));
      const [currentData] = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
        pending: businessOwnerTable.pending,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));
      // console.log('currentData', currentData);
      if (!currentData || !currentData.pending || !currentData.balance)
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );
      return {
        currentBalance: currentData.balance,
        currentPending: currentData.pending,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  async moveMoneyFromPendingToTotalAmountSpent(
    data: {
      amount: number;
    },
    userId: string,
  ) {
    try {
      const { amount } = data;
      await this.DbProvider.update(businessOwnerTable)
        .set({
          balance: sql`${businessOwnerTable.balance} - ${amount}`,
          pending: sql`${businessOwnerTable.pending} + ${amount}`,
        })
        .where(eq(businessOwnerTable.userId, userId));
      const [currentData] = await this.DbProvider.select({
        balance: businessOwnerTable.balance,
        pending: businessOwnerTable.pending,
      })
        .from(businessOwnerTable)
        .where(eq(businessOwnerTable.userId, userId));
      // console.log('currentData', currentData);
      if (!currentData || !currentData.pending || !currentData.balance)
        throw new InternalServerErrorException(
          'An error occured fetching current payment data, please try again',
        );
      return {
        currentBalance: currentData.balance,
        currentPending: currentData.pending,
      };
    } catch (error) {
      console.log(error);
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

  async paymentDashboard(userId) {}
}
