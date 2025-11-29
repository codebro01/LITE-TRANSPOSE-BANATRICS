import { Injectable, Inject } from '@nestjs/common';
import { PackageType } from '@src/campaign/dto/publishCampaignDto';
import { packageTable } from '@src/db/package';
import { CreatePackageDto } from '@src/package/dto/create-package.dto';
import { UpdatePackageDto } from '@src/package/dto/update-package.dto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


// ! package is referred to as pkg, because we cannot use package because package is a reserved keyword. 
@Injectable()
export class PackageRepository {
  constructor(
    @Inject('DB')
    private readonly DbProvider: NodePgDatabase<typeof import('@src/db')>,
  ) {}
  async create(createPackageDto: CreatePackageDto, userId: string) {
    const [pkg] = await this.DbProvider.insert(packageTable)
      .values({...createPackageDto, userId})
      .returning();

    return pkg;
  }

  async findAll() {
    const pkg = await this.DbProvider.select().from(packageTable);

    return pkg;
  }

  async findOne(packageId: string) {
    const pkg = await this.DbProvider.select()
      .from(packageTable)
      .where(eq(packageTable.id, packageId));

    return pkg;
  }
  async findByPackageType(packageType: PackageType) {
    const pkg = await this.DbProvider.select()
      .from(packageTable)
      .where(eq(packageTable.packageType, packageType)).limit(1);

    return pkg;
  }

  async update(updatePackageDto: UpdatePackageDto, packageId: string) {
    const [pkg] = await this.DbProvider.update(packageTable)
      .set(updatePackageDto)
      .where(eq(packageTable.id, packageId)).returning();

    return pkg;
  }

  remove(id: number) {
    return `This action removes a #${id} package`;
  }
}
