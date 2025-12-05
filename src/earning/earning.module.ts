import { Module } from '@nestjs/common';
import { EarningService } from './earning.service';
import { EarningController } from './earning.controller';
import { DbModule } from '@src/db/db.module'
;
import { EarningRepository } from '@src/earning/repository/earning.repository';

@Module({
  imports: [DbModule], 
  controllers: [EarningController],
  providers: [EarningService, EarningRepository],
  exports: [EarningService, EarningRepository]
})
export class EarningModule {}
