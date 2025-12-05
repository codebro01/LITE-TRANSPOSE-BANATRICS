import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EarningService } from './earning.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { UpdateEarningDto } from './dto/update-earning.dto';

@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  @Post()
  create(@Body() createEarningDto: CreateEarningDto) {
    return this.earningService.create(createEarningDto);
  }

  @Get()
  findAll() {
    return this.earningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.earningService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEarningDto: UpdateEarningDto) {
    return this.earningService.update(+id, updateEarningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.earningService.remove(+id);
  }
}
