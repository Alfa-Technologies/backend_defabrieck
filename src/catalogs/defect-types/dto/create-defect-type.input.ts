import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateDefectTypeInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre del tipo de defecto debe ser un texto válido.',
  })
  @IsNotEmpty({ message: 'El nombre del tipo de defecto es obligatorio.' })
  @MaxLength(50, {
    message:
      'El nombre del tipo de defecto no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(150, {
    message: 'La descripción no puede exceder los $constraint1 caracteres.',
  })
  description?: string;

  @Field(() => String)
  @IsUUID('4', { message: 'El ID de la pieza debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La pieza es obligatoria.' })
  partId: string;
}
