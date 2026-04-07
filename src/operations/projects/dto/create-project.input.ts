import { InputType, Field, Float, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { ProjectStatus } from '../../constants/project-status.enum';
import { CreateShiftConfigInput } from './create-shift-config.input';
import { ShiftTypeEnum } from 'src/operations/constants/shifts.constants';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un cliente válido.' })
  @IsNotEmpty({ message: 'El cliente es obligatorio.' })
  customerId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un cliente final válido.' })
  @IsNotEmpty({ message: 'El cliente final es obligatorio.' })
  finalCustomerId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una planta válida.' })
  @IsNotEmpty({ message: 'La planta es obligatoria.' })
  plantId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un tipo de reporte válido.' })
  @IsNotEmpty({ message: 'El tipo de reporte es obligatorio.' })
  reportTypeId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un líder interno válido.' })
  @IsNotEmpty({ message: 'El líder interno es obligatorio.' })
  internalLeadId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un contacto de cliente válido.' })
  @IsNotEmpty({ message: 'El contacto de cliente es obligatorio.' })
  customerContactId: string;

  @Field(() => String)
  @IsUUID('4', {
    message: 'Debe seleccionar un contacto de cliente final válido.',
  })
  @IsNotEmpty({ message: 'El contacto de cliente final es obligatorio.' })
  finalCustomerContactId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La descripción del trabajo debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La descripción del trabajo es obligatoria.' })
  jobDescription: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El alcance debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El alcance es obligatorio.' })
  scope: string;

  @Field(() => String)
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria.' })
  startDate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin estimada debe ser una fecha válida.' },
  )
  endDateEst?: string;

  @Field(() => Int)
  @IsNumber({}, { message: 'La cantidad de inspectores debe ser un número.' })
  @IsNotEmpty({ message: 'La cantidad de inspectores es obligatoria.' })
  @Min(1, {
    message: 'La cantidad de inspectores debe ser al menos $constraint1.',
  })
  inspectorsAssigned: number;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El texto de verificación de inspección debe ser un texto válido.',
  })
  @IsOptional()
  inspectionVerificationText?: string;

  @Field(() => String)
  @IsDateString(
    {},
    { message: 'La fecha de punto de limpieza debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La fecha de punto de limpieza es obligatoria.' })
  cleanPointDate: string;

  @Field(() => Boolean)
  @IsBoolean({
    message: 'El campo requiere retrabajo debe ser verdadero o falso.',
  })
  @IsNotEmpty({ message: 'El campo requiere retrabajo es obligatorio.' })
  requiresRework: boolean;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El texto de verificación de retrabajo debe ser un texto válido.',
  })
  @IsOptional()
  reworkVerificationText?: string;

  @Field(() => GraphQLJSON)
  @IsOptional()
  verificationMethods: any;

  @Field(() => GraphQLJSON)
  @IsOptional()
  environmentConditions: any;

  @Field(() => [ShiftTypeEnum], { nullable: true })
  @IsArray({ message: 'Los turnos requeridos deben ser un arreglo.' })
  @IsEnum(ShiftTypeEnum, {
    each: true,
    message: 'Se proporcionó un turno inválido.',
  })
  @IsOptional()
  requiredShifts?: ShiftTypeEnum[];

  @Field(() => Float, { nullable: true })
  @IsNumber({}, { message: 'El precio unitario debe ser un número.' })
  @Min(1, { message: 'El precio unitario debe ser al menos $constraint1.' })
  @IsOptional()
  unitPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: 'La cantidad de piezas debe ser un número.' })
  @Min(1, { message: 'La cantidad de piezas debe ser al menos $constraint1.' })
  @IsOptional()
  pieceCount?: number;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El tipo de facturación debe ser un texto válido.' })
  @IsOptional()
  billingType?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(ProjectStatus, {
    message: 'El estado del proyecto debe ser un valor válido.',
  })
  @IsOptional()
  status?: ProjectStatus;
}
