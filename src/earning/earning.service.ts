import { Injectable } from '@nestjs/common';
import { CreateEarningDto } from './dto/create-earning.dto';
import { UpdateEarningDto } from './dto/update-earning.dto';

@Injectable()
export class EarningService {
  create(createEarningDto: CreateEarningDto) {
    return 'This action adds a new earning';
  }

  findAll() {
    return `This action returns all earning`;
  }

  findOne(id: number) {
    return `This action returns a #${id} earning`;
  }

  update(id: number, updateEarningDto: UpdateEarningDto) {
    return `This action updates a #${id} earning`;
  }

  remove(id: number) {
    return `This action removes a #${id} earning`;
  }
}
