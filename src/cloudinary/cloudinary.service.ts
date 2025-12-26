import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { cloudinary } from '@src/cloudinary/config';

@Injectable()
export class CloudinaryService {
  /**
   * Upload an image buffer to Cloudinary
   * @param fileBuffer - image file buffer (from Multer memoryStorage)
   * @param folder - Cloudinary folder name
   * @param verifyStudent - apply verify-student transformation?
   */
  async uploadImage(
    fileBuffer: Buffer,
    folder: string,
    // verifyStudent = false,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [{ width: 500, height: 500, crop: 'scale' }],
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            console.log(error);
            return reject(new BadRequestException('Failed to upload image'));
          }
          resolve(result);
        },
      );

      stream.end(fileBuffer);
    });
  }

  /**
   * Upload multiple images
   * @param files - array of file buffers
   * @param folder - Cloudinary folder name
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, folder),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(public_id: string): Promise<void> {
    console.log('got in here', public_id);
    await cloudinary.uploader.destroy(public_id);
  }
  async deleteManyImages(public_ids: string[]): Promise<void> {
    for (const id of public_ids) {
      await cloudinary.uploader.destroy(id);
    }
  }
}
