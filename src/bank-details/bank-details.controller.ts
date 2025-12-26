import {
  Controller,
  UseGuards,
  Patch,
  Body,
  Req,
  Query,
  Get,
} from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { VerifyBankDetailsDto } from '@src/bank-details/dto/verify-bank-details.dto';
import type { Request } from '@src/types';

@Controller('bank-details')
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('verify')
  async verifyBankInformation(@Query() query: VerifyBankDetailsDto) {
    const getBankInfo = await this.bankDetailsService.verifyBankDetails(query);

    return { success: true, data: getBankInfo.data.data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get()
  async findOneById(@Req() req: Request) {
    const { id: userId } = req.user;
    const bankInfo = await this.bankDetailsService.findOneById(userId);

    return {
      success: true,
      data: {
        accountNumber: bankInfo.accountNumber,
        accountName: bankInfo.accountName,
        bankName: bankInfo.bankName,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch('update')
  async updateBankInformation(
    @Body() body: VerifyBankDetailsDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;
    const updateBankInfo =
      await this.bankDetailsService.saveUserBankInformation(body, userId);

    return { success: true, data: updateBankInfo };
  }
}
