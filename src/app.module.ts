import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from '@src/neon/neon.module';
import { NeonProvider } from '@src/neon/neon.provider';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterService } from './multer/multer.service';
import { MulterModule } from './multer/multer.module';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { CampaignModule } from './campaign/campaign.module';
import { PaymentModule } from './payment/payment.module';
import { UtilsModule } from './utils/utils.module';
import { CatchErrorModule } from './catch-error/catch-error.module';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from './email/email.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { PackageModule } from './package/package.module';
import { BullModule } from '@nestjs/bull';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
          tls:
            configService.get('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : undefined,
          // retryStrategy: (times) => {
          //   if (times > 3) {
          //     console.error('Redis connection failed after 3 attempts');
          //     return null;
          //   }
          //   return Math.min(times * 1000, 3000);
          // },
          // connectTimeout: 5000,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    SupabaseModule,
    JwtModule,
    CloudinaryModule,
    MulterModule,
    UploadModule,
    CampaignModule,
    PaymentModule,
    UtilsModule,
    CatchErrorModule,
    NotificationModule,
    EmailModule,
    DashboardModule,
    SettingsModule,
    PackageModule,
    PasswordResetModule,
    EmailVerificationModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, NeonProvider, MulterService],
})
export class AppModule {}
