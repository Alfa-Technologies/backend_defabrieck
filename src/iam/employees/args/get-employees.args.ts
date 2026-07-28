import { ArgsType, Field, IntersectionType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
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
}

@ArgsType()
export class GetEmployeesArgs extends IntersectionType(
  SearchEmployeesArgs,
  PaginationArgs,
) {}
