import { Controller, Body, Patch, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { VehicleDetailsService } from './vehicle-details.service';
import { CreateVehicleDetailDto } from './dto/create-vehicle-detail.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorators';
import type  { Request } from '@src/types';
import type  { Response } from 'express';

@Controller('vehicle-details')
export class VehicleDetailsController {
  constructor(private readonly vehicleDetailsService: VehicleDetailsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Patch(':id')
  async update(
    @Body() body: CreateVehicleDetailDto,
    @Req() req: Request, 
    @Res() res: Response
  ) {
    const {id: userId} = req.user;
    const update = await this.vehicleDetailsService.update(
      body,
      userId,
      body.vehicleDetailsId,
    );

    res.status(HttpStatus.OK).json({message: 'success', data: update})
  }
}
