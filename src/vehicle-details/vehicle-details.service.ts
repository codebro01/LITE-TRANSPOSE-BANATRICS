import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDetailDto } from './dto/create-vehicle-detail.dto';
import { VehicleDetailsRepository } from '@src/vehicle-details/repository/vehicle-details.repository';

@Injectable()
export class VehicleDetailsService {
  constructor(private readonly vehicleDetailsRepository: VehicleDetailsRepository){}
  async update(
     data: CreateVehicleDetailDto,
     userId: string,
     vehicleDetailsId?: string,
   ) {
     const existingVehicleDetails =
       await this.vehicleDetailsRepository.findVehicleDetailsByUserId(userId);
 
     if (vehicleDetailsId && existingVehicleDetails.length > 0) {
       const updatedVehicle = await this.vehicleDetailsRepository.update(data, userId, vehicleDetailsId)
 
       if (!updatedVehicle) {
         throw new NotFoundException('Vehicle details not found');
       }
 
       return updatedVehicle;
     }
 
    if(existingVehicleDetails) throw new BadRequestException("Provide vehicle details id to update this user's vehicle details")
     const newVehicle = await this.vehicleDetailsRepository.create(data, userId)
     return newVehicle;
   }
}
