import { ArgsType, Field, IntersectionType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from '../../../common/dto/args/pagination.args';

@ArgsType()
class SearchEmployeesArgs {
  @Field(() => String, {
    nullable: true,
    description:
      'Texto libre para buscar por nombre, apellido, correo o código de empleado.',
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena de texto.' })
  search?: string;

  @Field(() => Boolean, {
    nullable: true,
    description:
      'Si es true, restringe el resultado solo a empleados del departamento de Operaciones. Usado por el buscador de personal de planta (asistencia). Por defecto no filtra por departamento.',
  })
  @IsOptional()
  @IsBoolean({ message: 'onlyOperations debe ser un valor booleano.' })
  onlyOperations?: boolean;
}

@ArgsType()
export class GetEmployeesArgs extends IntersectionType(
  SearchEmployeesArgs,
  PaginationArgs,
) {}
