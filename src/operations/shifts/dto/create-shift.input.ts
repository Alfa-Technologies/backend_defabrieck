import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DayOfWeek } from '../../../operations/constants/day-of-week.enum';

@InputType()
export class CreateShiftInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una planta válida.' })
  @IsNotEmpty({ message: 'La planta es obligatoria.' })
  plantId: string;

  @Field(() => String, { nullable: true })
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsOptional()
  projectId?: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del turno debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre del turno es obligatorio.' })
  @MaxLength(50, {
    message:
      'El nombre del turno no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La hora de inicio debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe estar en formato HH:MM (24 horas).',
  })
  startTime: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La hora de fin debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe estar en formato HH:MM (24 horas).',
  })
  endTime: string;

  @Field(() => [DayOfWeek], { nullable: true })
  @IsArray({ message: 'Los días de trabajo deben ser un arreglo.' })
  @IsOptional()
  @IsEnum(DayOfWeek, {
    each: true,
    message: 'Cada día de trabajo debe ser un día válido de la semana.',
  })
  workDays?: DayOfWeek[];
}
