import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateEmployeeInput {
  @Field(() => String, { nullable: true })
  @IsUUID('4', { message: 'El ID de usuario proporcionado no es válido.' })
  @IsOptional()
  userId?: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50, {
    message: 'El nombre no puede exceder los $constraint1 caracteres.',
  })
  firstName: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El apellido debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(50, {
    message: 'El apellido no puede exceder los $constraint1 caracteres.',
  })
  lastName: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsOptional()
  @MaxLength(100, {
    message:
      'El correo electrónico no puede exceder los $constraint1 caracteres.',
  })
  email?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(20, {
    message: 'El teléfono no puede exceder los $constraint1 caracteres.',
  })
  phoneNumber?: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El código de empleado debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El código de empleado es obligatorio.' })
  @MaxLength(20, {
    message:
      'El código de empleado no puede exceder los $constraint1 caracteres.',
  })
  employeeCode: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El puesto debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El puesto es obligatorio.' })
  @MaxLength(50, {
    message: 'El puesto no puede exceder los $constraint1 caracteres.',
  })
  position: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El departamento debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El departamento es obligatorio.' })
  @MaxLength(50, {
    message: 'El departamento no puede exceder los $constraint1 caracteres.',
  })
  department: string;
}
