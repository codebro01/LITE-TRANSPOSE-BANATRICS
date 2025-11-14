import { Test, TestingModule } from '@nestjs/testing';
import { CatchErrorService } from './catch-error.service';

describe('CatchErrorService', () => {
  let service: CatchErrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatchErrorService],
    }).compile();

    service = module.get<CatchErrorService>(CatchErrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
