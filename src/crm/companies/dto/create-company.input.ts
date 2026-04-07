import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateCompanyInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre comercial debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre comercial es obligatorio.' })
  @MaxLength(100, {
    message:
      'El nombre comercial no puede exceder los $constraint1 caracteres.',
  })
  commercialName: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La razón social debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La razón social es obligatoria.' })
  @MinLength(3, {
    message: 'La razón social debe tener al menos $constraint1 caracteres.',
  })
  @MaxLength(200, {
    message: 'La razón social no puede exceder los $constraint1 caracteres.',
  })
  legalName: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El RFC debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El RFC no puede exceder los $constraint1 caracteres.',
  })
  taxId?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección fiscal debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(100, {
    message:
      'La dirección fiscal no puede exceder los $constraint1 caracteres.',
  })
  billingAddress?: string;
}
