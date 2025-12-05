import { Test, TestingModule } from '@nestjs/testing';
import { BankDetailsService } from './bank-details.service';

describe('BankDetailsService', () => {
  let service: BankDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankDetailsService],
    }).compile();

    service = module.get<BankDetailsService>(BankDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
