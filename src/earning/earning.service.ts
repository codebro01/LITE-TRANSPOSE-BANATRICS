import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
// import { CreateEarningDto } from './dto/create-earning.dto';
// import { UpdateEarningDto } from './dto/update-earning.dto';
import { ConfigService } from '@nestjs/config';
import { InitializeEarningDto } from '@src/earning/dto/initialize-earning.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EarningService {
  private readonly baseUrl: string = 'https://api.paystack.co';
  private readonly secretkey: string; 
  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {}


  async initializeWithdrawal(data: InitializeEarningDto) {
    const response = await firstValueFrom(this.httpService.post(`${this.baseUrl}/transfer`))
  }



}
