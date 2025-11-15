import { Module } from '@nestjs/common';
import { DashboardController } from '@src/dashboard/dashboard.controller';
import { HomeDashboardService } from '@src/dashboard/dashboard.service';
import { HomeDashboardsRepository } from '@src/dashboard/repository/dashboard.repository';
import { DbModule } from '@src/db/db.module';

@Module({
  imports: [DbModule], 
  controllers: [DashboardController],
  providers: [HomeDashboardService, HomeDashboardsRepository],
})
export class DashboardModule {}
