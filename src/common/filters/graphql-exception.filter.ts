import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

// Mapea el status HTTP a un código de error que el front puede interpretar.
const HTTP_STATUS_TO_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
};

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;

        if (responseObj.message && Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `GraphQL Error - Operation: ${info.operation?.operation} - Field: ${info.fieldName} - Message: ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    const code = HTTP_STATUS_TO_CODE[status] || 'INTERNAL_SERVER_ERROR';

    // Devuelve un error estructurado para que el front pueda reaccionar
    // (extensions.code / extensions.statusCode), en vez de un error crudo.
    return new GraphQLError(message, {
      extensions: {
        code,
        statusCode: status,
      },
    });
  }
}
