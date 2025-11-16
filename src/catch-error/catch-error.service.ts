import { Injectable } from '@nestjs/common';
import { HttpStatus, HttpException } from '@nestjs/common';

@Injectable()
export class CatchErrorService {
    constructor() {}

    catch(error: any, defaultMessage: string) {
        throw new HttpException(
                error.response?.data?.message ||
                  error?.message ||
                  defaultMessage,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
    }
}
