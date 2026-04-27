import { InputType, Field } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
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

  @Field(() => String, { nullable: true, description: 'CURP del empleado' })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString({ message: 'El CURP debe ser un texto válido.' })
  @IsOptional()
  @MinLength(18, { message: 'El CURP debe tener 18 caracteres.' })
  @MaxLength(18, { message: 'El CURP debe tener 18 caracteres.' })
  curp?: string;

  @Field(() => String, { nullable: true, description: 'RFC del empleado' })
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString({ message: 'El RFC debe ser un texto válido.' })
  @IsOptional()
  @MinLength(12, { message: 'El RFC debe tener entre 12 y 13 caracteres.' })
  @MaxLength(13, { message: 'El RFC debe tener entre 12 y 13 caracteres.' })
  rfc?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Número de Seguro Social (IMSS)',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El NSS debe ser un texto válido.' })
  @IsOptional()
  @MinLength(11, { message: 'El NSS debe tener 11 caracteres.' })
  @MaxLength(11, { message: 'El NSS debe tener 11 caracteres.' })
  nss?: string;

  @Field(() => String, { nullable: true, description: 'Género del empleado' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El género debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(20, {
    message: 'El género no puede exceder los $constraint1 caracteres.',
  })
  gender?: string;

  @Field(() => String, { nullable: true, description: 'Estado civil' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El estado civil debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(30, {
    message: 'El estado civil no puede exceder los $constraint1 caracteres.',
  })
  maritalStatus?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Dirección del empleado',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(500, {
    message: 'La dirección no puede exceder los $constraint1 caracteres.',
  })
  address?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Fecha de nacimiento (formato ISO: YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe estar en formato ISO (YYYY-MM-DD).',
    },
  )
  @IsOptional()
  birthDate?: string;
}
