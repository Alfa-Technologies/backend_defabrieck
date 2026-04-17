import { registerEnumType } from '@nestjs/graphql';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ServiceType {
  SCHEDULE = 'SCHEDULE',
  INVENTORY = 'INVENTORY',
}

export enum QuoteHistoryAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  ADD_NOTE = 'ADD_NOTE',
  REMOVE_NOTE = 'REMOVE_NOTE',
  ADD_SERVICE = 'ADD_SERVICE',
  REMOVE_SERVICE = 'REMOVE_SERVICE',
}

// Registramos los Enums para que GraphQL los reconozca en tu esquema
registerEnumType(QuoteStatus, { name: 'QuoteStatus' });
registerEnumType(ServiceType, { name: 'ServiceType' });
registerEnumType(QuoteHistoryAction, { name: 'QuoteHistoryAction' });
