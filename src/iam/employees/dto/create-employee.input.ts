import { InputType, Field, Float } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateBeneficiaryInput } from './create-beneficiary.input';
import { DateDDMMYYYYScalar } from '../../../common/scalars/date.scalar';

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

  @Field(() => DateDDMMYYYYScalar, {
    nullable: true,
    description: 'Fecha de nacimiento (formato DD/MM/YYYY)',
  })
  @IsOptional()
  birthDate?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Nacionalidad del empleado',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La nacionalidad debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(50, {
    message: 'La nacionalidad no puede exceder los $constraint1 caracteres.',
  })
  nationality?: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Salario diario del empleado',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El salario diario debe ser un número válido.' },
  )
  @Min(0, { message: 'El salario diario no puede ser menor a 0.' })
  @Max(999999.99, {
    message: 'El salario diario excede el monto máximo permitido.',
  })
  @IsOptional()
  dailySalary?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Nombre del banco',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del banco debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(100, {
    message:
      'El nombre del banco no puede exceder los $constraint1 caracteres.',
  })
  bankName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Número de cuenta bancaria',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de cuenta debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(20, {
    message:
      'El número de cuenta no puede exceder los $constraint1 caracteres.',
  })
  accountNumber?: string;

  @Field(() => String, {
    nullable: true,
    description: 'CLABE interbancaria (18 dígitos)',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La CLABE debe ser un texto válido.' })
  @IsOptional()
  @MinLength(18, { message: 'La CLABE debe tener 18 caracteres.' })
  @MaxLength(18, { message: 'La CLABE debe tener 18 caracteres.' })
  clabe?: string;

  @Field(() => [CreateBeneficiaryInput], {
    nullable: true,
    description: 'Lista de beneficiarios del empleado',
  })
  @IsArray({ message: 'Los beneficiarios deben ser una lista válida.' })
  @ArrayMaxSize(10, {
    message: 'No se pueden registrar más de $constraint1 beneficiarios.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateBeneficiaryInput)
  @IsOptional()
  beneficiaries?: CreateBeneficiaryInput[];
}
