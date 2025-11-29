import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageRepository } from '@src/package/repository/package.repository';

@Injectable()
export class PackageService {
  constructor(private readonly packageRepository: PackageRepository) {}
  async create(data: CreatePackageDto, userId: string) {
    const isPackageTypeExist = await this.packageRepository.findByPackageType(data.packageType);
    if(isPackageTypeExist.length > 0) throw new BadRequestException(`Package type ${data.packageType} already exists please update it if you need to make changes!!!`)
    const pkg = await this.packageRepository.create(data, userId);
    return pkg;
  }

  async findAll() {
    const pkg = await this.packageRepository.findAll();
    return pkg;
  }

  async findOne(packageId: string) {
    const pkg = await this.packageRepository.findOne(packageId);
    return pkg;
  }

  async update(packageId: string, updatePackageDto: UpdatePackageDto) {
        const pkg = await this.packageRepository.update(updatePackageDto, packageId);
        return pkg;
  }

   remove(id: string) {
    return `This action removes a #${id} package`;
  }
}
