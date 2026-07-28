import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateDepartmentInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del departamento debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio.' })
  @MinLength(2, {
    message: 'El nombre del departamento debe tener al menos $constraint1 caracteres.',
  })
  @MaxLength(100, {
    message: 'El nombre del departamento no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(500, {
    message: 'La descripción no puede exceder los $constraint1 caracteres.',
  })
  description?: string;
}
