import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreatePlantInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre de la planta debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre de la planta es obligatorio.' })
  @MinLength(3, {
    message:
      'El nombre de la planta debe tener al menos $constraint1 caracteres.',
  })
  @MaxLength(100, {
    message:
      'El nombre de la planta no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una empresa válida.' })
  @IsNotEmpty({ message: 'La empresa es obligatoria.' })
  companyId: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(100, {
    message: 'La dirección no puede exceder los $constraint1 caracteres.',
  })
  address?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(50, {
    message: 'La ciudad no puede exceder los $constraint1 caracteres.',
  })
  city?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El estado no puede exceder los $constraint1 caracteres.',
  })
  state?: string;
}
