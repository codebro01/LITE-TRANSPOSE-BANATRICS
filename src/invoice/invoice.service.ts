import { Injectable } from '@nestjs/common';
import { invoicesInsertType } from '@src/db';
import { InvoiceRepository } from '@src/invoice/repository/invoice.repository';

@Injectable()
export class InvoiceService {
    constructor(private readonly invoiceRepository: InvoiceRepository){}


      async create(data: Omit<invoicesInsertType, 'userId' | 'campaignId'>,campaignId: string,  userId: string) {
        const invoice = await this.invoiceRepository.create(data, campaignId, userId)
    
        return invoice;
      }
}
