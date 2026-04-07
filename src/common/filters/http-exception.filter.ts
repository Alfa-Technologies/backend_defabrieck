import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).message
      ) {
        const msg = (exceptionResponse as any).message;
        message = Array.isArray(msg) ? msg.join(', ') : msg;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Error: ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    if (host.getType<GqlContextType>() === 'graphql') {
      return exception;
    }

    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      });
    }
  }
}
