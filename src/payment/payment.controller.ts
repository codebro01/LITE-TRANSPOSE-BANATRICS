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
} from '@nestjs/common';
import { PaymentService } from '@src/payment/payment.service';
import type {RawBodyRequest} from '@nestjs/common'

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initialize')
  async initializePayment(
    @Body() body: { email: string; amount: number; metadata?: any },
  ) {
    const result = await this.paymentService.initializePayment({
      email: body.email,
      amount: body.amount, // Amount should be in kobo (multiply by 100 for NGN)
      metadata: body.metadata,
    });

    return {
      success: true,
      data: result.data,
    };
  }

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
   handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = this.paymentService.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      return { status: 'invalid signature' };
    }

    const event = req.body as any;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        // Handle successful payment
        console.log('Payment successful:', event.data);
        // Update your database, send confirmation email, etc.
        break;

      case 'charge.failed':
        // Handle failed payment
        console.log('Payment failed:', event.data);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return { status: 'success' };
  }

  @Get('transactions')
  async listTransactions() {
    const result = await this.paymentService.listTransactions();
    return result;
  }
}
