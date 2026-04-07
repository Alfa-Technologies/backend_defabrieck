import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
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

    throw exception;
  }
}
