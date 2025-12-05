import { Controller } from '@nestjs/common';
import { BankDetailsService } from './bank-details.service';

@Controller('bank-details')
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}
}
