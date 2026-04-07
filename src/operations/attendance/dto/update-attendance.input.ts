import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateAttendanceInput } from './create-attendance.input';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

@InputType()
export class UpdateAttendanceInput extends PartialType(CreateAttendanceInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  @IsNotEmpty({ message: 'El ID es obligatorio.' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'La razón debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(100, {
    message: 'La razón no puede exceder los $constraint1 caracteres.',
  })
  reason?: string;
}
