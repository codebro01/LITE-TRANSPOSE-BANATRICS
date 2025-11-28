import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { DbModule } from '@src/db/db.module';
import { PackageRepository } from '@src/package/repository/package.repository';

@Module({
  imports:[DbModule], 
  controllers: [PackageController],
  providers: [PackageService, PackageRepository],
})
export class PackageModule {}
