import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import {BullModule} from '@nestjs/bull';
import { EmailTemplate } from '@src/email/templates/email.templates';

@Module({
  imports:[ BullModule.registerQueue({name: 'email', defaultJobOptions: {
    attempts: 3, 
    backoff:{
      type: 'exponential', 
      delay: 7000, 

    },
    removeOnComplete: true, 
    removeOnFail: false
  }})], 
  providers: [EmailService, EmailTemplate], 
  exports:[EmailService, EmailTemplate]
})
export class EmailModule {}
