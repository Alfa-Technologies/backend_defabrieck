import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateSupplierInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del proveedor debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre del proveedor es obligatorio.' })
  @MinLength(3, {
    message: 'El nombre del proveedor debe tener al menos $constraint1 caracteres.',
  })
  @MaxLength(200, {
    message: 'El nombre del proveedor no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @MaxLength(100, {
    message: 'El correo electrónico no puede exceder los $constraint1 caracteres.',
  })
  email: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @MaxLength(20, {
    message: 'El teléfono no puede exceder los $constraint1 caracteres.',
  })
  phone: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(300, {
    message: 'La dirección no puede exceder los $constraint1 caracteres.',
  })
  address?: string;
}
