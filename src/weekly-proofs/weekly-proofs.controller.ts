import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('weekly-proofs')
export class WeeklyProofsController {
  constructor(private readonly weeklyProofsService: WeeklyProofsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'Submit weekly proof, url of the weekly proof will be submitted after using the upload function to upload it',
    summary: 'Submit weekly proof',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload successful',
  })
  async submitWeeklyProof(
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
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Find all submitted weekly proofs by driver',
    summary: 'Find all submitted weekly proofs by drivers',
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched Data successfully',
  })
  async findAllByUserId(@Res() res: Response, @Req() req: Request) {
    const { id: userId } = req.user;

    const weeklyProof = await this.weeklyProofsService.findAllByUserId(userId);

    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: weeklyProof });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Find single weekly proof by driver',
    summary: 'Find single weekly proof by drivers',
  })
  @ApiResponse({
    status: 200,
    description: 'Found weekly proof',
  })
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
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'update weekly proofs by driver',
    summary: 'update weekly proofs by drivers',
  })
  @ApiResponse({
    status: 200,
    description: 'Update successful',
  })
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
      userId,
    );
    res
      .status(HttpStatus.CREATED)
      .json({ message: 'success', data: weeklyProof });
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.weeklyProofsService.remove(id);
  // }
}
