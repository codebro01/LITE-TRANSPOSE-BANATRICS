import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  // HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DrizzleExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(exception)

    //! Handle Postgres duplicate key (wrapped in cause)
    if (exception.cause?.code === '23505') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.cause.detail,
        error: exception.cause.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    //! Handle network errors
    if (['ENOTFOUND', 'ECONNREFUSED'].includes(exception.code)) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Unstable network connection!!!',
        error: exception.code,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    //! Handle timeouts
    if (exception.code === 'ETIMEDOUT') {
      return response.status(HttpStatus.GATEWAY_TIMEOUT).json({
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Database connection timed out',
        error: 'TIMEOUT',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    // console.log(exception.response.statasCode === 400);
    if (exception?.response?.statusCode === 400 || exception.status === 400) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          exception?.response?.message || 'Bad request was sent to the server',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    if (exception?.response?.statusCode === 401 || exception.status === 401) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message:
          exception?.response?.message || 'You are not authorized to access this place',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    if (exception?.response?.statusCode === 404 || exception.status === 404) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message:
          exception?.response?.message || 'We could not find what you are looking for',
        error: 'Resource not found',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    //! Default fallback (true 500s only)
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception?.message || 'Unexpected internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
