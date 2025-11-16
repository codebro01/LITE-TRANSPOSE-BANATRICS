import { Injectable } from '@nestjs/common';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import type { Express } from 'express';

@Injectable()
export class MulterService {
  private storage: StorageEngine;
  public upload: multer.Multer;

  constructor() {
    this.storage = multer.memoryStorage();

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
    });
  }

  private fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format') as unknown as null, false);
    }
  };
}
