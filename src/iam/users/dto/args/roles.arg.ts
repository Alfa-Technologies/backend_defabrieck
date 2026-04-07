import { ArgsType } from '@nestjs/graphql';
import { ValidRoles } from '../../../auth/enums/valid-roles.enum';
import { IsArray } from 'class-validator';
import { Field } from '@nestjs/graphql';

@ArgsType()
export class ValidRolesArgs {
  @Field(() => [ValidRoles], { nullable: true })
  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  roles: ValidRoles[] = [];
}
