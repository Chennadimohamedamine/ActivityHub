import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../errors/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Defaults
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      code = res?.code ?? this.mapStatusToCode(status);
      message = res?.message ?? message;

    
      if (Array.isArray(res?.message)) {
        code = ErrorCode.VALIDATION_ERROR;
        message = 'Validation failed';
        errors = this.formatValidationErrors(res.message);
      }
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(errors && { errors }),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private formatValidationErrors(messages: string[]) {
    const result: Record<string, string[]> = {};

    messages.forEach((msg) => {
      const field = msg.split(' ')[0];
      result[field] = result[field] || [];
      result[field].push(msg);
    });

    return result;
  }

  private mapStatusToCode(status: number): ErrorCode {
    switch (status) {
      case 401:
        return ErrorCode.INVALID_CREDENTIALS;
      case 403:
        return ErrorCode.FORBIDDEN_RESOURCE;
      case 404:
        return ErrorCode.NOT_FOUND;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
