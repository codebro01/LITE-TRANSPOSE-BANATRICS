import { Test, TestingModule } from '@nestjs/testing';
import { InstallmentProofsService } from './installment-proofs.service';

describe('InstallmentProofsService', () => {
  let service: InstallmentProofsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallmentProofsService],
    }).compile();

    service = module.get<InstallmentProofsService>(InstallmentProofsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
