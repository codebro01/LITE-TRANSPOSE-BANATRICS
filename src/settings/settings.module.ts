import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { UserService } from '@src/users/users.service';
import { UserModule } from '@src/users/users.module';
import { AuthModule } from '@src/auth/auth.module';
import { DbModule } from '@src/db/db.module';

@Module({
imports:[UserModule, AuthModule, DbModule],
  controllers: [SettingsController],
  providers: [UserService],
})
export class SettingsModule {}
