import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsDate, IsString, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

@InputType()
export class CreatePersonnelAssignmentInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un empleado válido.' })
  @IsNotEmpty({ message: 'El empleado es obligatorio.' })
  employeeId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una planta válida.' })
  @IsNotEmpty({ message: 'La planta es obligatoria.' })
  plantId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un turno válido.' })
  @IsNotEmpty({ message: 'El turno es obligatorio.' })
  shiftId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La fecha de inicio debe ser un texto válido.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de inicio debe estar en formato YYYY-MM-DD.',
  })
  startDate: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La fecha de fin debe ser un texto válido.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de fin debe estar en formato YYYY-MM-DD.',
  })
  endDate: string;
}
