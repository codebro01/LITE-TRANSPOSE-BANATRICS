// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multer, { StorageEngine } from 'multer';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage() as StorageEngine,
    }),
  )
  async uploadImage(@UploadedFile() file: multer.File) {
    console.log(file);
    if (!file) throw new BadRequestException('Please select an image file');

    const maxSize = 1024 * 1024 * 10; // 10MB
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG are allowed');
    }
    if (file.size > maxSize) {
      throw new BadRequestException('Image file too big (max 10MB)');
    }

    const result = await this.cloudinaryService.uploadImage(
      file.buffer,
      'my-folder',
    );
    return { uploaded: result };
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: multer.memoryStorage() as StorageEngine,
    }),
  )
  
  async uploadImages(@UploadedFiles() files: multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please upload at least one image');
    }

    const results = await this.cloudinaryService.uploadMultipleImages(
      files,
      'my-folder',
    );

    return { uploaded: results };
  }
}
