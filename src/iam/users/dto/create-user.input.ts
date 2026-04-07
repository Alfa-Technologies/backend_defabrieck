import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidRoles } from '../../auth/enums/valid-roles.enum';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @Field(() => String)
  @MinLength(8, {
    message: 'La contraseña debe tener al menos $constraint1 caracteres.',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;

  @Field(() => [ValidRoles])
  @IsArray({ message: 'Los roles deben ser proporcionados como un arreglo.' })
  roles: ValidRoles[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del empleado debe ser un UUID válido.' })
  employeeId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del contacto debe ser un UUID válido.' })
  companyContactId?: string;
}
