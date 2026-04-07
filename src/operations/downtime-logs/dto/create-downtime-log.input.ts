import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateDowntimeLogInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @IsUUID('4', {
    message: 'Debe seleccionar una razón de tiempo muerto válida.',
  })
  @IsNotEmpty({ message: 'La razón de tiempo muerto es obligatoria.' })
  downtimeReasonId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un empleado válido.' })
  @IsNotEmpty({ message: 'El empleado es obligatorio.' })
  employeeId: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'La hora de inicio debe ser una fecha válida.' })
  startTime?: Date;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'Los comentarios deben ser un texto válido.' })
  @IsOptional()
  @MaxLength(500, {
    message: 'Los comentarios no pueden exceder los $constraint1 caracteres.',
  })
  comments?: string;
}
