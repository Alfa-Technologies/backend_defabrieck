import { ArgsType, IntersectionType } from '@nestjs/graphql';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { ValidRolesArgs } from '../dto/args/roles.arg';

@ArgsType()
export class GetUsersArgs extends IntersectionType(
  ValidRolesArgs,
  PaginationArgs,
) {}
