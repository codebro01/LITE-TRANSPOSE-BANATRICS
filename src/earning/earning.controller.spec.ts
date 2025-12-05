import { Test, TestingModule } from '@nestjs/testing';
import { EarningController } from './earning.controller';
import { EarningService } from './earning.service';

describe('EarningController', () => {
  let controller: EarningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EarningController],
      providers: [EarningService],
    }).compile();

    controller = module.get<EarningController>(EarningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
