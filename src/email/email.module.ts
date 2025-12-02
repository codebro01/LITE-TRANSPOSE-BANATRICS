import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import {BullModule} from '@nestjs/bull';
import { EmailTemplate } from '@src/email/templates/email.templates';
import { EmailProcessor } from '@src/email/processor/email.processor';
import { EmailSenderService } from '@src/email/email-sender.service';

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
  providers: [EmailService, EmailTemplate, EmailProcessor, EmailSenderService], 
  exports:[EmailService, EmailTemplate, EmailSenderService]
})
export class EmailModule {}
