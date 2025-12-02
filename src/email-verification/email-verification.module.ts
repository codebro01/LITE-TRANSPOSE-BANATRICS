import { Module } from '@nestjs/common';
import { DbModule } from '@src/db/db.module';
import { EmailVerificationRepository } from '@src/email-verification/repository/email-verification.repository';
@Module({
  imports: [DbModule],
  providers: [EmailVerificationRepository],
  exports: [EmailVerificationRepository],
})
export class EmailVerificationModule {}
