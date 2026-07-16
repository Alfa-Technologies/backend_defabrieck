import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SyncClaimsResult {
  @Field(() => Int, { description: 'Total de usuarios procesados' })
  total: number;

  @Field(() => Int, { description: 'Usuarios sincronizados exitosamente' })
  synced: number;

  @Field(() => Int, { description: 'Usuarios que fallaron al sincronizar' })
  failed: number;
}
