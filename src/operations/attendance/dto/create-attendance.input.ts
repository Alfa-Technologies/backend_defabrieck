import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateAttendanceInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un empleado válido.' })
  @IsNotEmpty({ message: 'El empleado es obligatorio.' })
  employeeId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una planta válida.' })
  @IsNotEmpty({ message: 'La planta es obligatoria.' })
  plantId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El tipo de registro debe ser un texto válido.' })
  @IsIn(['CHECK_IN', 'CHECK_OUT', 'LUNCH_START', 'LUNCH_END'], {
    message:
      'El tipo debe ser "CHECK_IN", "CHECK_OUT", "LUNCH_START" o "LUNCH_END".',
  })
  type: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El método de registro debe ser un texto válido.' })
  @IsIn(['GPS', 'MANUAL', 'KIOSK'], {
    message: 'El método debe ser "GPS", "MANUAL" o "KIOSK".',
  })
  method: string;

  @Field(() => Float, { nullable: true })
  @IsNumber({}, { message: 'La latitud debe ser un número válido.' })
  @IsOptional()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber({}, { message: 'La longitud debe ser un número válido.' })
  @IsOptional()
  longitude?: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'La fecha y hora deben ser una fecha válida.' })
  timestamp?: Date;
}
