import { Injectable, Inject } from '@nestjs/common';
import { vehicleDetailsTable } from '@src/db';
import { CreateVehicleDetailDto } from '@src/vehicle-details/dto/create-vehicle-detail.dto';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
@Injectable()
export class VehicleDetailsRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}

  async findVehicleDetailsByUserId(userId: string) {
    const vehicleDetails = await this.DbProvider.select()
      .from(vehicleDetailsTable)
      .where(eq(vehicleDetailsTable.userId, userId));
    return vehicleDetails;
  }

  async update(
    data: CreateVehicleDetailDto,
    userId: string,
    vehicleDetailsId: string,
  ) {
  



      const [updatedVehicle] = await this.DbProvider.update(vehicleDetailsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(vehicleDetailsTable.userId, userId),
            eq(vehicleDetailsTable.id, vehicleDetailsId),
          ),
        )
        .returning();

  

      return updatedVehicle;
    


  }
  async create(
    data: CreateVehicleDetailDto,
    userId: string,
  ) {
    const [newVehicle] = await this.DbProvider.insert(vehicleDetailsTable)
      .values({ ...data, userId })
      .returning();

    return newVehicle;
  }
}
