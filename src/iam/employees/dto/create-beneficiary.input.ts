import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateBeneficiaryInput {
  @Field(() => String, { description: 'Nombre completo del beneficiario' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre completo debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre completo del beneficiario es obligatorio.' })
  @MaxLength(150, {
    message:
      'El nombre completo no puede exceder los $constraint1 caracteres.',
  })
  fullName: string;

  @Field(() => String, { description: 'Parentesco con el empleado' })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El parentesco debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El parentesco es obligatorio.' })
  @MaxLength(50, {
    message: 'El parentesco no puede exceder los $constraint1 caracteres.',
  })
  relationship: string;

  @Field(() => String, {
    nullable: true,
    description: 'Teléfono de contacto del beneficiario',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(20, {
    message: 'El teléfono no puede exceder los $constraint1 caracteres.',
  })
  contactPhone?: string;

  @Field(() => Float, {
    description: 'Porcentaje asignado al beneficiario (0-100)',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje debe ser un número válido.' },
  )
  @Min(0, { message: 'El porcentaje no puede ser menor a 0.' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100.' })
  percentage: number;
}
