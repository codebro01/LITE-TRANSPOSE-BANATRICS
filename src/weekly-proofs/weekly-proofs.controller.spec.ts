import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyProofsController } from './weekly-proofs.controller';
import { WeeklyProofsService } from './weekly-proofs.service';

describe('WeeklyProofsController', () => {
  let controller: WeeklyProofsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyProofsController],
      providers: [WeeklyProofsService],
    }).compile();

    controller = module.get<WeeklyProofsController>(WeeklyProofsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
