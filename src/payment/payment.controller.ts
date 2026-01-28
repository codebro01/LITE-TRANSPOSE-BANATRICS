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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiHeader,
  ApiExcludeEndpoint,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { PaymentService } from '@src/payment/payment.service';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import type { Request } from '@src/types';
import type { Response } from 'express';
import { NotificationService } from '@src/notification/notification.service';
import { InitializePaymentDto } from '@src/payment/dto/initializePaymentDto';


@ApiTags('Payments')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Initialize a payment transaction',
    description:
      'Initializes a payment transaction with Paystack. Returns a payment authorization URL and reference that can be used to complete the payment. Only accessible by business owners.',
  })
  @ApiCookieAuth('access_token')
  @ApiBody({
    description: 'Payment initialization data',
    type: InitializePaymentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment initialized successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            authorization_url: {
              type: 'string',
              example: 'https://checkout.paystack.com/abc123xyz',
            },
            access_code: { type: 'string', example: 'abc123xyz' },
            reference: { type: 'string', example: 'ref_1234567890' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid payment data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a business owner',
  })
  async initializePayment(
    @Body()
    body: InitializePaymentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { email, id: userId, role } = req.user;

    const result = await this.paymentService.initializePayment({
      ...body,
      email,
      userId,
      role, 
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: result.data,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('verify/:reference')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Verify a payment transaction',
    description:
      'Verifies the status of a payment transaction using its reference. This should be called after the customer completes payment on Paystack.',
  })
  @ApiParam({
    name: 'reference',
    type: String,
    description: 'Payment reference returned during initialization',
    example: 'ref_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Verification successful' },
        data: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'failed', 'pending'],
              example: 'success',
            },
            reference: { type: 'string', example: 'ref_1234567890' },
            amount: { type: 'number', example: 50000 },
            currency: { type: 'string', example: 'NGN' },
            paid_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-11-16T10:35:00Z',
            },
            channel: {
              type: 'string',
              enum: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
              example: 'card',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a business owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Payment reference not found',
  })
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
  @ApiOperation({
    summary: 'Handle Paystack webhook events',
    description:
      'Receives and processes webhook notifications from Paystack for payment events. Handles charge success, failure, pending, refund, and transfer events. This endpoint does not require authentication as it is called by Paystack.',
  })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'Webhook signature for verification',
    required: true,
    schema: { type: 'string' },
  })
  @ApiBody({
    description: 'Paystack webhook event payload',
    schema: {
      type: 'object',
      properties: {
        event: {
          type: 'string',
          enum: [
            'charge.success',
            'charge.failed',
            'charge.pending',
            'refund.processed',
            'transfer.success',
            'transfer.failed',
            'transfer.reversed',
          ],
          example: 'charge.success',
        },
        data: {
          type: 'object',
          properties: {
            reference: { type: 'string', example: 'ref_1234567890' },
            amount: { type: 'number', example: 50000 },
            currency: { type: 'string', example: 'NGN' },
            status: { type: 'string', example: 'success' },
            authorization: {
              type: 'object',
              properties: {
                channel: { type: 'string', example: 'card' },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                campaignName: { type: 'string' },
                invoiceId: { type: 'string' },
                amountInNaira: { type: 'number' },
                dateInitiated: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['success', 'already processed', 'error logged'],
          example: 'success',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid webhook signature',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'invalid signature' },
      },
    },
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const payload = JSON.stringify(req.body);

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
    const payment =
      await this.paymentService.postVerifyWebhookSignatures(event);
    return payment;
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @Get('list-all-transactions')
  // @ApiOperation({
  //   summary: 'List all transactions from Paystack',
  //   description:
  //     'Retrieves all transactions from Paystack API. Returns a comprehensive list of all payment transactions across the platform.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Transactions retrieved successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       status: { type: 'boolean', example: true },
  //       message: { type: 'string', example: 'Transactions retrieved' },
  //       data: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             id: { type: 'number', example: 123456 },
  //             reference: { type: 'string', example: 'ref_1234567890' },
  //             amount: { type: 'number', example: 50000 },
  //             status: { type: 'string', example: 'success' },
  //             currency: { type: 'string', example: 'NGN' },
  //             created_at: { type: 'string', format: 'date-time' },
  //             channel: { type: 'string', example: 'card' },
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorized - Invalid or missing JWT token',
  // })
  // @ApiResponse({
  //   status: 403,
  //   description: 'Forbidden - User is not a business owner',
  // })
  // async listTransactions() {
  //   const result = await this.paymentService.listAllTransactions();
  //   return result;
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('list-transactions')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get user transactions from database',
    description:
      'Retrieves all payment transactions for the authenticated user from the application database. Includes deposits, campaign payments, and refunds.',
  })
  @ApiResponse({
    status: 200,
    description: 'User transactions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'txn_123abc' },
              reference: { type: 'string', example: 'ref_1234567890' },
              amount: { type: 'number', example: 50000 },
              transactionType: {
                type: 'string',
                enum: ['deposit', 'withdrawal', 'campaign_payment', 'refund'],
                example: 'deposit',
              },
              paymentStatus: {
                type: 'string',
                enum: ['success', 'failed', 'pending', 'refunded'],
                example: 'success',
              },
              paymentMethod: { type: 'string', example: 'card' },
              campaignName: { type: 'string', example: 'Christmas Campaign' },
              invoiceId: { type: 'string', example: 'INV-2024-001' },
              dateInitiated: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a business owner',
  })
  async getTransactionsFromDB(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;

    const result = await this.paymentService.listTransactions(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('businessOwner')
  @Get('dashboard-data')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get payment dashboard analytics',
    description:
      'Retrieves comprehensive payment analytics and statistics for the dashboard. Includes total deposits, withdrawals, balance, transaction counts, and trends.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            currentBalance: {
              type: 'number',
              example: 150000,
              description: 'Current wallet balance',
            },
            totalDeposits: {
              type: 'number',
              example: 500000,
              description: 'Total amount deposited',
            },
            totalWithdrawals: {
              type: 'number',
              example: 350000,
              description: 'Total amount withdrawn/spent',
            },
            transactionCount: {
              type: 'number',
              example: 45,
              description: 'Total number of transactions',
            },
            successfulTransactions: {
              type: 'number',
              example: 42,
            },
            failedTransactions: {
              type: 'number',
              example: 3,
            },
            recentTransactions: {
              type: 'array',
              description: 'Last 10 transactions',
              items: {
                type: 'object',
              },
            },
            monthlyTrend: {
              type: 'array',
              description: 'Monthly transaction trends',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string', example: '2024-11' },
                  deposits: { type: 'number', example: 100000 },
                  withdrawals: { type: 'number', example: 75000 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a business owner',
  })
  async getPaymentDashboardData(@Req() req: Request, @Res() res: Response) {
    const { id: userId } = req.user;

    const result = await this.paymentService.paymentDashboard(userId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }

  @Get('callback-test')
  @ApiExcludeEndpoint()
  async handleCallback(@Query() query: any) {
    const verified = await this.paymentService.verifyPayment(query.reference);

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
