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
  UseGuards
} from '@nestjs/common';
import { PaymentService } from '@src/payment/payment.service';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaystackMetedataDto } from './dto/paystackMetadataDto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';


@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Post('initialize')
  async initializePayment(
    @Body()
    body: { amount: number; metadata: PaystackMetedataDto },
    @Req() req,
  ) {
    const { email, userId } = req.user;
    const result = await this.paymentService.initializePayment({
      email: email,
      amount: body.amount, // Amount should be in kobo (multiply by 100 for NGN)
      metadata: { ...body.metadata, userId, amount: body.amount },
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

    const event = req.body;

    console.log(event);

return;
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('transactions')
  async listTransactions() {
    const result = await this.paymentService.listTransactions();
    return result;
  }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('businessOwner')
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
