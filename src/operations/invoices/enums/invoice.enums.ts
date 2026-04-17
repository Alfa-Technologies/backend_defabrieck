import { registerEnumType } from '@nestjs/graphql';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });
