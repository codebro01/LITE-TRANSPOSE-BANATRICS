// src/db/db.module.ts
import { Module } from '@nestjs/common';
import { DbProvider } from '@src/db/provider';

@Module({
  providers: [DbProvider],
  exports: [DbProvider],
})
export class DbModule {}
