import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DrizzleExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(exception);

    if (exception?.status === 401) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: exception?.response?.message || 'Unauthorized',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception?.status === 403) {
      return response.status(HttpStatus.FORBIDDEN).json({
        statusCode: 403,
        message: exception?.response?.message || 'Forbidden',
        error: 'Forbidden',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

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

    //! Handle network errors (check both top-level AND cause)
    const errorCode = exception.code || exception.cause?.code;
    if (['ENOTFOUND', 'ECONNREFUSED'].includes(errorCode)) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Unstable network connection!!!',
        error: errorCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    //! Handle timeouts (check both top-level AND cause)
    if (errorCode === 'ETIMEDOUT') {
      return response.status(HttpStatus.GATEWAY_TIMEOUT).json({
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Unstable network connection!!!',
        error: 'TIMEOUT',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    //! Handle Drizzle query errors (prevent exposing query details)
    if (
      exception.constructor?.name === 'DrizzleQueryError' ||
      exception.message?.includes('Failed query')
    ) {
      // Log full error for debugging
      console.error('Database query error:', {
        query: exception.query,
        params: exception.params,
        cause: exception.cause,
      });

      // Return sanitized error to client
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed. Please try again later.',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception?.response?.statusCode === 400 || exception.status === 400) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          exception?.response?.message ||
          exception?.response?.data?.message ||
          'Bad request was sent to the server',
        error: exception?.response?.error || 'Bad Request',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception?.response?.statusCode === 403 || exception.status === 403) {
      return response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message:
          exception?.response?.message ||
          exception?.response?.data?.message ||
          'Forbidden request',
        error: exception?.response?.error || 'Forbidden',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (
      exception?.response?.statusCode === 422 ||
      exception?.status === 422 ||
      exception.data?.status === 422
    ) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          exception?.response?.message ||
          exception?.response?.data?.message ||
          exception?.data.message ||
          'Unauthorized request',
        error: exception?.response?.error || 'Unauthorized',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception?.response?.statusCode === 404 || exception.status === 404) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message:
          exception?.response?.message ||
          'We could not find what you are looking for',
        error: exception?.response?.error || 'Resource not found',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (
      exception.message.includes('already in use') ||
      exception.message.includes('already exists')
    ) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: exception?.response?.error || 'Conflict',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    //! Default fallback (true 500s only) - sanitized
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        exception?.response?.message || 'Unexpected internal server error',
      error: exception?.response?.error || 'Unexpected internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
