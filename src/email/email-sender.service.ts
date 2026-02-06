import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EmailJobData, EmailResponse } from './types/types';

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
  }

  async sendEmail(data: EmailJobData): Promise<EmailResponse> {
    try {
      // Build email data conditionally - only include defined fields
      const emailData: any = {
        from: data.from || this.fromEmail,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
      };

      // Only add optional fields if they exist
      if (data.html) emailData.html = data.html;
      if (data.text) emailData.text = data.text;
      if (data.replyTo) emailData.reply_to = data.replyTo;
      if (data.cc && data.cc.length > 0) emailData.cc = data.cc;
      if (data.bcc && data.bcc.length > 0) emailData.bcc = data.bcc;
      if (data.attachments && data.attachments.length > 0) {
        emailData.attachments = data.attachments;
      }

      const response = await this.resend.emails.send(emailData);
     console.log('response', response)
      this.logger.log(`Email sent successfully: ${response.data?.id}`);
      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
