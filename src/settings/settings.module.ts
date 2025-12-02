import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { UserService } from '@src/users/users.service';
import { UserModule } from '@src/users/users.module';
import { AuthModule } from '@src/auth/auth.module';
import { DbModule } from '@src/db/db.module';
import { EmailModule } from '@src/email/email.module';
import { PasswordResetModule } from '@src/password-reset/password-reset.module';
import { EmailVerificationModule } from '@src/email-verification/email-verification.module';

@Module({
  imports: [UserModule, AuthModule, DbModule, EmailModule, PasswordResetModule, EmailVerificationModule],
  controllers: [SettingsController],
  providers: [UserService],
})
export class SettingsModule {}
