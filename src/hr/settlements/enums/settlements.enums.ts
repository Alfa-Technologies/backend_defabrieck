import { registerEnumType } from '@nestjs/graphql';

export enum TerminationReason {
  RENUNCIA_VOLUNTARIA = 'RENUNCIA_VOLUNTARIA',
  DESPIDO_JUSTIFICADO = 'DESPIDO_JUSTIFICADO',
  DESPIDO_INJUSTIFICADO = 'DESPIDO_INJUSTIFICADO',
  TERMINO_DE_CONTRATO = 'TERMINO_DE_CONTRATO',
  MUTUO_ACUERDO = 'MUTUO_ACUERDO',
  FALLECIMIENTO = 'FALLECIMIENTO',
}

export enum SettlementStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

registerEnumType(TerminationReason, { name: 'TerminationReason' });
registerEnumType(SettlementStatus, { name: 'SettlementStatus' });
