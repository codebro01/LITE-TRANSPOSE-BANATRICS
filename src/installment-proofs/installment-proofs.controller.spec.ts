import { Test, TestingModule } from '@nestjs/testing';
import { InstallmentProofsController } from './installment-proofs.controller';
import { InstallmentProofsService } from './installment-proofs.service';

describe('InstallmentProofsController', () => {
  let controller: InstallmentProofsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallmentProofsController],
      providers: [InstallmentProofsService],
    }).compile();

    controller = module.get<InstallmentProofsController>(InstallmentProofsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
