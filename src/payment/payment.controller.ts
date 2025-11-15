import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Res,
  Patch,
} from '@nestjs/common';
import { PaymentService } from '@src/payment/payment.service';
import type { RawBodyRequest } from '@nestjs/common';
import { PaystackMetedataDto } from './dto/paystackMetadataDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { MakePaymentForCampaignDto } from '@src/payment/dto/makePaymentForCampaignDto';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { NotificationService } from '@src/notification/notification.service';
import {
  CategoryType,
  StatusType,
  VariantType,
} from '@src/notification/dto/createNotificationDto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('initialize')
  async initializePayment(
    @Body()
    body: { amount: number; metadata: PaystackMetedataDto },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { email, id: userId } = req.user;
    // console.log(userId);

    const result = await this.paymentService.initializePayment({
      email: email,
      amount: body.amount, // Amount should be in kobo (multiply by 100 for NGN)
      metadata: {
        ...body.metadata,
        userId,
        amount: body.amount,
        amountInNaira: body.amount / 100,
      },
    });

    // console.log(result);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result.data,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    const result = await this.paymentService.verifyPayment(reference);

    return {
      success: result.status,
      message: result.message,
      data: result.data,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = this.paymentService.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: 'invalid signature' });
    }

    const event = req.body;
    // console.log('Webhook event received:', event);

    try {
      const { reference } = event.data;
      const { channel } = event.data.authorization || {};
      const { campaignName, userId, amountInNaira, invoiceId, dateInitiated } =
        event.data.metadata || {};

      switch (event.event) {
        case 'charge.success': {
          // Check if this payment was already processed
          const existingPayment =
            await this.paymentRepository.findByReference(reference);

          if (existingPayment && existingPayment.paymentStatus === 'success') {
            // console.log('Payment already processed:', reference);
            return res
              .status(HttpStatus.OK)
              .json({ status: 'already processed' });
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
                transactionType: 'deposit', // Mark as deposit, not a transfer
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

          // console.log('Payment and balance updated successfully:', reference);
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

            // Deduct the refunded amount from balance
            await this.paymentRepository.updateBalance(
              { amount: -amountInNaira }, // Negative amount
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

          // console.log('Refund processed:', reference);
          break;
        }

        case 'transfer.success':
        case 'transfer.failed':
        case 'transfer.reversed': {
          // console.log('Transfer event:', event.event, reference);
          break;
        }

        default:
        // console.log('Unhandled event type:', event.event);
      }

      return res.status(HttpStatus.OK).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(HttpStatus.OK).json({ status: 'error logged' });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('list-all-transactions')
  async listTransactions() {
    const result = await this.paymentService.listAllTransactions();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('make-payment-for-campaign')
  async makePaymentForCampaign(
    @Body()
    body: MakePaymentForCampaignDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    // console.log(userId);

    const result = await this.paymentService.makePaymentForCampaign(
      { campaignId: body.campaignId },
      userId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('finalize-payment-for-campaign')
  async finalizePaymentForCampaign(
    @Body()
    body: MakePaymentForCampaignDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId } = req.user;
    // console.log(userId);

    const result = await this.paymentService.finalizePaymentForCampaign(
      { campaignId: body.campaignId },
      userId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('list-transactions')
  async getTransactionsFromDB(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;
    // console.log(userId);

    const result = await this.paymentService.listTransactions(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('dashboard-data')
  async getPaymentDashboardData(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;
    // console.log(userId);

    const result = await this.paymentService.paymentDashboard(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @Get('callback-test')
  async handleCallback(@Query() query: any) {
    // console.log('Callback received:', query);

    // Verify the payment
    const verified = await this.paymentService.verifyPayment(query.reference);

    // Return HTML so you can see it in browser
    return `
    <html>
      <body>
        <h1>Payment ${verified.data.status}</h1>
        <pre>${JSON.stringify(verified.data, null, 2)}</pre>
      </body>
    </html>
  `;
  }
}
