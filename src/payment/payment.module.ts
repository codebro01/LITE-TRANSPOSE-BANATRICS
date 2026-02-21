import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DbModule } from '@src/db/db.module';
import {  HttpModule } from '@nestjs/axios';
import { UserModule } from '@src/users/users.module';
import { PaymentRepository } from '@src/payment/repository/payment.repository';
import { CampaignModule } from '@src/campaign/campaign.module';
import { CatchErrorModule } from '@src/catch-error/catch-error.module';
import { NotificationModule } from '@src/notification/notification.module';
import { EarningModule } from '@src/earning/earning.module';
import { OneSignalModule } from '@src/one-signal/one-signal.module';

@Module({
  imports: [
    DbModule,
    HttpModule,
    UserModule,
    forwardRef(() => CampaignModule),
    CatchErrorModule,
    NotificationModule,
    EarningModule,
    OneSignalModule, 
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}

