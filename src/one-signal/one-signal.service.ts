// onesignal.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OneSignalService {
  private client: OneSignal.DefaultApi;
  private appId: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID');

    if (!this.appId)
      throw new BadRequestException('Please provide one signal app id');

    const configuration = OneSignal.createConfiguration({
      restApiKey: this.configService.get<string>('ONESIGNAL_REST_API_KEY'),
    });

    this.client = new OneSignal.DefaultApi(configuration);
  }

  async sendNotificationToUser(
    userId: string,
    heading: string,
    content: string,
    data?: any,
  ) {
    if (!this.appId)
      throw new BadRequestException('Please provide one signal app id');

    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.include_aliases = { external_id: [userId] };
    notification.target_channel = 'push';
  notification.priority = 10;
    notification.headings = { en: heading };
    notification.contents = { en: content };
    
    if (data) {
      notification.data = data;
    }

    try {
      const response = await this.client.createNotification(notification);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendNotificationToSubscription(
    subscriptionId: string,
    heading: string,
    content: string,
    data?: any,
  ) {
    if (!this.appId)
      throw new BadRequestException('Please provide one signal app id');

    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.include_subscription_ids = [subscriptionId];
    notification.headings = { en: heading };
    notification.contents = { en: content };

    if (data) {
      notification.data = data;
    }

    try {
      const response = await this.client.createNotification(notification);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendNotificationToAll(heading: string, content: string, data?: any) {
    if (!this.appId)
      throw new BadRequestException('Please provide one signal app id');

    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.included_segments = ['All'];
    notification.headings = { en: heading };
    notification.contents = { en: content };

    if (data) {
      notification.data = data;
    }

    try {
      const response = await this.client.createNotification(notification);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}
