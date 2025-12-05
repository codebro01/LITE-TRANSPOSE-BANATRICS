import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EarningService } from './earning.service';
import { CreateEarningDto } from './dto/create-earning.dto';
import { UpdateEarningDto } from './dto/update-earning.dto';

@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  @Post()
  create(@Body() createEarningDto: CreateEarningDto) {
  }

  @Get()
  findAll() {
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEarningDto: UpdateEarningDto) {
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
  }
}
