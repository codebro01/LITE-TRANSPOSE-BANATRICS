import { Module } from '@nestjs/common';
import { VehicleDetailsService } from './vehicle-details.service';
import { VehicleDetailsController } from './vehicle-details.controller';
import { DbModule } from '@src/db/db.module';
import { VehicleDetailsRepository } from '@src/vehicle-details/repository/vehicle-details.repository';

@Module({
  imports: [DbModule],
  controllers: [VehicleDetailsController],
  providers: [VehicleDetailsService, VehicleDetailsRepository],
  exports: [VehicleDetailsService, VehicleDetailsRepository]
})
export class VehicleDetailsModule {}
