import { registerEnumType } from '@nestjs/graphql';

export enum ContractType {
  DETERMINADO = 'DETERMINADO',
  INDETERMINADO = 'INDETERMINADO',
  PERIODO_PRUEBA = 'PERIODO_PRUEBA',
  CAPACITACION_INICIAL = 'CAPACITACION_INICIAL',
  HONORARIOS = 'HONORARIOS',
}

export enum ContractStatus {
  VIGENTE = 'VIGENTE',
  TERMINADO = 'TERMINADO',
  CANCELADO = 'CANCELADO',
}

registerEnumType(ContractType, { name: 'ContractType' });
registerEnumType(ContractStatus, { name: 'ContractStatus' });
