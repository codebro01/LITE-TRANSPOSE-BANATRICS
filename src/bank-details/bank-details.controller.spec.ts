import { Test, TestingModule } from '@nestjs/testing';
import { BankDetailsController } from './bank-details.controller';
import { BankDetailsService } from './bank-details.service';

describe('BankDetailsController', () => {
  let controller: BankDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankDetailsController],
      providers: [BankDetailsService],
    }).compile();

    controller = module.get<BankDetailsController>(BankDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
