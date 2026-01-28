import { forwardRef, Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepository } from './repository/auth.repository';
import { DbModule } from '@src/db/db.module';
import { SupabaseModule } from '@src/neon/neon.module';
import { UserModule } from '@src/users/users.module';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1d' }, // token expiry
    }),
    DbModule,
    SupabaseModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard],
  exports: [AuthRepository, AuthService, JwtAuthGuard],
})
export class AuthModule {}
