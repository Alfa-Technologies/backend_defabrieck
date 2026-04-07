import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    nullable: true,
    description: 'Número de registros a omitir',
  })
  @IsOptional()
  @IsInt({ message: 'El desplazamiento debe ser un número entero.' })
  @Min(0, { message: 'El desplazamiento no puede ser menor a cero.' })
  offset?: number = 0;

  @Field(() => Int, {
    nullable: true,
    description: 'Límite de registros por página',
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite debe ser de al menos 1 registro.' })
  @Max(100, {
    message: 'No puedes solicitar más de 100 registros a la vez.',
  })
  limit?: number = 10;
}
