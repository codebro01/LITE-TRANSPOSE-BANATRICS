import { Injectable } from '@nestjs/common';
import { HomeDashboardsRepository } from '@src/dashboard/repository/dashboard.repository';

@Injectable()
export class HomeDashboardService {
  constructor(
    private readonly homeDashboardsRepository: HomeDashboardsRepository,
  ) {}

  async businessOwnerHomeDashboard(userId: string) {
      const result = await this.homeDashboardsRepository.businessOwnerHomeDashboard(userId);
      return result;
  }

  async driverHomeDashboard(userId: string) {
      const result = await this.homeDashboardsRepository.driverHomeDashboard(userId);
      return result;
  }
}
