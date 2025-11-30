import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from '@src/email/email.service';
import { EmailJobData } from '@src/email/types/types';


@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`);

    try {
      const result = await this.emailService.sendEmail(job.data);

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
