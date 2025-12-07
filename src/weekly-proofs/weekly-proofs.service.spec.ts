import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyProofsService } from './weekly-proofs.service';

describe('WeeklyProofsService', () => {
  let service: WeeklyProofsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyProofsService],
    }).compile();

    service = module.get<WeeklyProofsService>(WeeklyProofsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
