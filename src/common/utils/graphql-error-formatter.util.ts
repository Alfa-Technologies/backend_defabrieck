import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const formatError = (error: any) => {
  const originalMessage = error.extensions?.originalError?.message;
  if (Array.isArray(originalMessage)) {
    return originalMessage[0];
  }
  if (
    error instanceof BadRequestException ||
    error instanceof NotFoundException ||
    error instanceof UnauthorizedException ||
    error instanceof ForbiddenException ||
    error instanceof ConflictException ||
    error instanceof UnprocessableEntityException ||
    error.message?.includes('Email/password invalid') ||
    error.message?.includes('User is inactive') ||
    error.message?.includes('needs a valid role') ||
    error.message?.includes('is inactive, talk to an admin') ||
    error.message?.includes('No se encontró') ||
    error.message?.includes('No se puede activar') ||
    error.message?.includes('requiere un motivo') ||
    error.message?.includes('falta') ||
    error.message?.includes('no permitida') ||
    error.message?.includes('not found') ||
    error.message?.includes('already exists') ||
    error.message?.includes('duplicate') ||
    error.message?.includes('Invalid') ||
    error.message?.includes('Required') ||
    error.message?.includes('must be') ||
    error.message?.includes('cannot be') ||
    error.message?.includes('validation failed') ||
    error.message?.includes('Foreign Key constraint failed') ||
    error.message?.includes('Project Part ID not found') ||
    error.message?.includes('User ID not found') ||
    error.message?.includes('Ya existe un usuario') ||
    error.message?.includes('El código de empleado') ||
    error.message?.includes('La contraseña proporcionada') ||
    error.message?.includes('Su cuenta de usuario está desactivada') ||
    error.message?.includes('La referencia proporcionada') ||
    error.message?.includes('El usuario asignado') ||
    error.message?.includes('Error inesperado en la base de datos')
  ) {
    return error.message;
  }

  if (
    error.extensions?.exception?.code === 'INTERNAL_SERVER_ERROR' ||
    error.extensions?.code === 'INTERNAL_SERVER_ERROR' ||
    error.message?.includes('Unexpected error') ||
    error.message?.includes('check server logs') ||
    error.name === 'QueryFailedError' ||
    (error.name === 'TypeError' &&
      !error.message?.includes('GraphQL')) ||
    (error.message?.includes('database') &&
      !error.message?.includes('not found')) ||
    (error.message?.includes('connection') &&
      !error.message?.includes('not found'))
  ) {
    console.error('[INTERNAL_ERROR]', {
      error: error.message,
      stack: error.stack,
      extensions: error.extensions,
      timestamp: new Date().toISOString(),
    });

    return 'Internal server error';
  }

  return error.message || 'Unknown error occurred';
};
