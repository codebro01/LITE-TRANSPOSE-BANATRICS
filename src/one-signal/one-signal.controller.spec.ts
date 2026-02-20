import { Test, TestingModule } from '@nestjs/testing';
import { OneSignalController } from './one-signal.controller';
import { OneSignalService } from './one-signal.service';

describe('OneSignalController', () => {
  let controller: OneSignalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OneSignalController],
      providers: [OneSignalService],
    }).compile();

    controller = module.get<OneSignalController>(OneSignalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
