import { Module } from '@nestjs/common';
import { DbModule } from '@src/db/db.module';
import { PasswordResetRepository } from '@src/password-reset/repository/password-reset.repository';

@Module({
    imports: [DbModule], 
    providers:[PasswordResetRepository], 
    exports:[PasswordResetRepository]
})
export class PasswordResetModule {}
