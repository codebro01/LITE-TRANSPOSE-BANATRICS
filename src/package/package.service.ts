import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageRepository } from '@src/package/repository/package.repository';

@Injectable()
export class PackageService {
  constructor(private readonly packageRepository: PackageRepository) {}
  async create(createPackageDto: CreatePackageDto, userId: string) {
    const pkg = await this.packageRepository.create(createPackageDto, userId);
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
