import { Module } from '@nestjs/common';
import { NotificationService } from '@src/notification/notification.service';
import { NotificationController } from '@src/notification/notification.controller';
import { NotificationRepository } from '@src/notification/repository/notification.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [NotificationService, NotificationRepository],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationRepository]
})
export class NotificationModule {}
