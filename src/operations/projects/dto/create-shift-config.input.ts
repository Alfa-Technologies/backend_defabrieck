import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';
import { DayOfWeek } from '../../constants/day-of-week.enum';
import { ShiftTypeEnum } from '../../../operations/constants/shifts.constants';

@InputType()
export class CreateShiftConfigInput {
  @Field(() => ShiftTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ShiftTypeEnum, {
    message: 'El tipo de turno debe ser un valor válido.',
  })
  type?: ShiftTypeEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'El nombre del turno debe ser un texto válido.' })
  @MaxLength(50, {
    message:
      'El nombre del turno no puede exceder los $constraint1 caracteres.',
  })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'La hora de inicio debe ser un texto válido.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de inicio debe estar en formato HH:MM (24 horas).',
  })
  startTime?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'La hora de fin debe ser un texto válido.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de fin debe estar en formato HH:MM (24 horas).',
  })
  endTime?: string;

  @Field(() => [DayOfWeek], { nullable: true })
  @IsArray({ message: 'Los días de trabajo deben ser un arreglo.' })
  @IsOptional()
  @IsEnum(DayOfWeek, {
    each: true,
    message: 'Cada día de trabajo debe ser un día válido de la semana.',
  })
  workDays?: DayOfWeek[];
}
