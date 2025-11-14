import { Module } from '@nestjs/common';
import { CatchErrorService } from './catch-error.service';

@Module({
  providers: [CatchErrorService], 
  exports: [CatchErrorService]
})
export class CatchErrorModule {}
