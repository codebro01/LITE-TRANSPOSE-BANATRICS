import { Test, TestingModule } from '@nestjs/testing';
import { EarningService } from './earning.service';

describe('EarningService', () => {
  let service: EarningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EarningService],
    }).compile();

    service = module.get<EarningService>(EarningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
