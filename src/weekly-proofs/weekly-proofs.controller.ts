import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  UseGuards,
  Res
} from '@nestjs/common';
import { WeeklyProofsService } from './weekly-proofs.service';
import { CreateWeeklyProofDto } from './dto/create-weekly-proof.dto';
import { UpdateWeeklyProofDto } from './dto/update-weekly-proof.dto';
import type { Response } from 'express';
import type { Request } from '@src/types';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';

@Controller('weekly-proofs')
export class WeeklyProofsController {
  constructor(private readonly weeklyProofsService: WeeklyProofsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post('create')
  async create(
    @Body() data: CreateWeeklyProofDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;
  
    const weeklyProof = await this.weeklyProofsService.create(data, userId);
    // console.log('weeklyproof', weeklyProof)
    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: weeklyProof });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('find-all')
  async findAllByUserId(@Res() res: Response, @Req() req: Request) {
    const { id: userId } = req.user;

    const weeklyProof = await this.weeklyProofsService.findAllByUserId(userId);

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: weeklyProof });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get('find/:id')
  async findOneByUserId(
    @Param('id') weeklyProofId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user;

    const weeklyProof = await this.weeklyProofsService.findOneByUserId(
      weeklyProofId,
      userId,
    );

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: weeklyProof });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch('update/:id')
  async update(
    @Param('id') weeklyProofId: string,
    @Body() data: UpdateWeeklyProofDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
        const { id: userId } = req.user;

    const weeklyProof = await this.weeklyProofsService.update(
      data,
      weeklyProofId,
      userId
    );
  res
    .status(HttpStatus.CREATED)
    .json({ message: 'success', data: weeklyProof });
    
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyProofsService.remove(id);
  }
}
