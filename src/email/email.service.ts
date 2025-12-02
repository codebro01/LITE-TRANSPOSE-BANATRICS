import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplate } from '@src/email/templates/email.templates';
import {
  EmailJobData,
  EmailTemplateType,
  WelcomeTemplateData,
  CampaignApprovedTemplateData,
  CampaignCreatedTemplateData,
  PasswordResetTemplateData,
  EmailVerificationTemplateData,
  EmailResponse,
} from '@src/email/types/types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private configService: ConfigService,
    private readonly emailTemplate: EmailTemplate,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>(
      'FROM_EMAIL',
      'onboarding@resend.dev',
    );
  }

  async queueEmail(data: EmailJobData, priority: number = 0): Promise<string> {
    try {
      const job = await this.emailQueue.add('send-email', data, {
        priority, // Lower number = higher priority
        attempts: 3,
      });

      this.logger.log(`Email queued with job ID: ${job.id}`);
      return job.id.toString();
    } catch (error) {
      this.logger.error('Failed to queue email:', error);
      throw error;
    }
  }


  async queueTemplatedEmail(
    template: EmailTemplateType,
    to: string | string[],
    data: Record<string, any>,
  ): Promise<string> {
            console.log('got into queue');

    const emailData = this.buildTemplateEmail(template, to, data);
    const queueEmail =  await this.queueEmail(emailData, this.getTemplatePriority(template));
    console.log(queueEmail)
    return queueEmail
  }


  private buildTemplateEmail(
    template: EmailTemplateType,
    to: string | string[],
    data: Record<string, any>,
  ): EmailJobData {
    switch (template) {
      case EmailTemplateType.WELCOME:
        return {
          to,
          subject: 'Welcome to Banatrics!',
          html: this.emailTemplate.getWelcomeTemplate(
            data as WelcomeTemplateData,
          ),
        };

      case EmailTemplateType.CAMPAIGN_CREATED:
        return {
          to,
          subject: `Campaign "${data.campaignName}" Created Successfully`,
          html: this.emailTemplate.getCampaignCreatedTemplate(
            data as CampaignCreatedTemplateData,
          ),
        };

      case EmailTemplateType.CAMPAIGN_APPROVED:
        return {
          to,
          subject: `Your Campaign "${data.campaignName}" Has Been Approved! ✅`,
          html: this.emailTemplate.getCampaignApprovedTemplate(
            data as CampaignApprovedTemplateData,
          ),
        };

      case EmailTemplateType.PASSWORD_RESET:
        return {
          to,
          subject: 'Reset Your Password',
          html: this.emailTemplate.getPasswordResetTemplate(
            data as PasswordResetTemplateData,
          ),
        };

      case EmailTemplateType.EMAIL_VERIFICATION:
        return {
          to,
          subject: 'Verify Your Email Address',
          html: this.emailTemplate.getEmailVerificationTemplate(
            data as EmailVerificationTemplateData,
          ),
        };

      default:
        throw new Error(`Unknown email template: ${template}`);
    }
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

  private getTemplatePriority(template: EmailTemplateType): number {
    const priorities = {
      [EmailTemplateType.PASSWORD_RESET]: 1, // Highest priority
      [EmailTemplateType.EMAIL_VERIFICATION]: 1,
      [EmailTemplateType.CAMPAIGN_APPROVED]: 2,
      [EmailTemplateType.CAMPAIGN_REJECTED]: 2,
      [EmailTemplateType.WELCOME]: 3,
      [EmailTemplateType.CAMPAIGN_CREATED]: 3,
    };
    return priorities[template] || 5;
  }
}
