import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDetailDto } from './create-vehicle-detail.dto';

export class UpdateVehicleDetailDto extends PartialType(CreateVehicleDetailDto) {}
