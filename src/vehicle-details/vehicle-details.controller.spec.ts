import { Test, TestingModule } from '@nestjs/testing';
import { VehicleDetailsController } from './vehicle-details.controller';
import { VehicleDetailsService } from './vehicle-details.service';

describe('VehicleDetailsController', () => {
  let controller: VehicleDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleDetailsController],
      providers: [VehicleDetailsService],
    }).compile();

    controller = module.get<VehicleDetailsController>(VehicleDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
