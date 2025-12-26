// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Param,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { CloudinaryService } from '@src/cloudinary/cloudinary.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { DeleteImagesDto } from '@src/upload/dto/delete-images.dto';
import { DeleteImageDto } from '@src/upload/dto/delete-image.dto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  @ApiOperation({
    summary: 'Upload a single image',
    description:
      'Uploads a single image file to Cloudinary. Accepts JPEG and PNG formats up to 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG or PNG, max 10MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image successfully uploaded',
    schema: {
      type: 'object',
      properties: {
        uploaded: {
          type: 'object',
          description: 'Cloudinary upload result',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - No file selected, invalid format, or file too large',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // console.log(file);
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
    return { secure_url: result.secure_url, public_id: result.public_id };
  }

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: multer.memoryStorage(),
    }),
  )
  @ApiOperation({
    summary: 'Upload multiple images',
    description:
      'Uploads multiple image files (up to 5) to Cloudinary. Each file must be JPEG or PNG format, max 10MB per file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Multiple image files (JPEG or PNG, max 5 files, 10MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images successfully uploaded',
    schema: {
      type: 'object',
      properties: {
        uploaded: {
          type: 'array',
          items: {
            type: 'object',
          },
          description: 'Array of Cloudinary upload results',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - No files uploaded, invalid format, or file too large',
  })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please upload at least one image');
    }

    const results = await this.cloudinaryService.uploadMultipleImages(
      files,
      'my-folder',
    );

    const mappedResult = results.map((result) => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));

    return { uploaded: mappedResult };
  }

  @Delete('delete/:public_id')
  @ApiOperation({
    summary: 'Delete image from Cloudinary',
    description: 'Deletes an image from Cloudinary storage using its public ID',
  })
  @ApiParam({
    name: 'public_id',
    description: 'The Cloudinary public ID of the image to delete',
    example: 'my-folder/gzgm58lm0waafed6idxa',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      example: {
        message: 'Image deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteImage(@Param() param: DeleteImageDto) {
    await this.cloudinaryService.deleteImage(param.public_id);

    return { messgae: 'Image deleted successfully' };
  }

  @Delete('delete-many')
  @ApiOperation({
    summary: 'Delete many images from Cloudinary',
    description: 'Deletes multiple images from Cloudinary storage using their public IDs',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      example: {
        message: 'Image deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteManyImages(@Body() body: DeleteImagesDto) {
    console.log('body', body);
    await this.cloudinaryService.deleteManyImages(body.public_ids);

    return { messgae: 'Images deleted successfully' };
  }
}
