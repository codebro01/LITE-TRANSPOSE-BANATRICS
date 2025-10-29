import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NeonProvider } from '@src/neon/neon.provider';

@Module({
  imports: [ConfigModule],
  providers: [NeonProvider],
  exports: [NeonProvider],
})
export class SupabaseModule {}
