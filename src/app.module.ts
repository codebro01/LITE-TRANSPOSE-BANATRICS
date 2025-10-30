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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
    }),
    UserModule,
    AuthModule,
    SupabaseModule,
    JwtModule,
    CloudinaryModule,
    MulterModule,
    UploadModule,
    CampaignModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, NeonProvider, MulterService],
})
export class AppModule {}
