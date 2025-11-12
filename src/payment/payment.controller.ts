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
  Patch
} from '@nestjs/common';
import { PaymentService } from '@src/payment/payment.service';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaystackMetedataDto } from './dto/paystackMetadataDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { UpdateBalanceDto } from './dto/updateBalanceDto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('initialize')
  async initializePayment(
    @Body()
    body: { amount: number; metadata: PaystackMetedataDto },
    @Req() req,
  ) {
    const { email, id: userId } = req.user;
    console.log(userId);

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

    return {
      success: true,
      data: result.data,
    };
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
    @Res() res,
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
    console.log('Webhook event received:', event);

    try {
      const { reference } = event.data;
      const { channel } = event.data.authorization || {};
      const { campaignName, userId, amountInNaira, invoiceId, dateInitiated } =
        event.data.metadata || {};

      switch (event.event) {
        // case 'charge.success': {
        //   await this.paymentRepository.savePayment(
        //     {
        //       campaignName,
        //       amount: amountInNaira,
        //       invoiceId,
        //       dateInitiated,
        //       paymentStatus: 'success',
        //       paymentMethod: channel,
        //       reference,
        //     },
        //     userId,
        //   );
        //   await this.paymentRepository.updateBalance(
        //     { amount: amountInNaira, reference },
        //     userId,
        //   );
        //   break;
        // }
        case 'charge.success': {
          // Check if this payment was already processed
          const existingPayment =
            await this.paymentRepository.findByReference(reference);

          if (existingPayment && existingPayment.paymentStatus === 'success') {
            console.log('Payment already processed:', reference);
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

          console.log('Payment and balance updated successfully:', reference);
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

          console.log('Refund processed:', reference);
          break;
        }

        case 'transfer.success':
        case 'transfer.failed':
        case 'transfer.reversed': {
          console.log('Transfer event:', event.event, reference);
          break;
        }

        default:
          console.log('Unhandled event type:', event.event);
      }

      return res.status(HttpStatus.OK).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(HttpStatus.OK).json({ status: 'error logged' });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('transactions')
  async listTransactions() {
    const result = await this.paymentService.listTransactions();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Patch('make-payment-for-campaign')
  async makePaymentForCampaign(
    @Body()
    body: UpdateBalanceDto,
    @Req() req,
    @Res() res, 
  ) {
    const {  id: userId } = req.user;
    console.log(userId);

    const result = await this.paymentService.makePaymentForCampaign(body.amount, userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result
    }) ;
  }

  @Get('callback-test')
  async handleCallback(@Query() query: any) {
    console.log('Callback received:', query);

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
