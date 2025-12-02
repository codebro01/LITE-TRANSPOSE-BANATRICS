import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailJobData } from '@src/email/types/types';
import { EmailSenderService } from '@src/email/email-sender.service';


@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private emailSenderService: EmailSenderService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);
      console.log('got in the emali processor')
    try {
      const result = await this.emailSenderService.sendEmail(job.data);
      console.log(result)

      if (!result.success) {
        throw new Error(result.error);
      }

      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email (attempt ${job.attemptsMade}):`,
        error,
      );
      throw error; // Bull will retry based on job options
    }
  }
}
