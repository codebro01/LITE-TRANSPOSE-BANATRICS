import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DbProvider } from '@src/db/provider';
import {  HttpModule } from '@nestjs/axios';
import { UserModule } from '@src/users/users.module';

@Module({
  imports: [HttpModule, UserModule],
  controllers: [PaymentController],
  providers: [PaymentService, DbProvider],
})
export class PaymentModule {}

