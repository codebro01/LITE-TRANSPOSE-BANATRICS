import { Test, TestingModule } from '@nestjs/testing';
import { VehicleDetailsService } from './vehicle-details.service';

describe('VehicleDetailsService', () => {
  let service: VehicleDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleDetailsService],
    }).compile();

    service = module.get<VehicleDetailsService>(VehicleDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
