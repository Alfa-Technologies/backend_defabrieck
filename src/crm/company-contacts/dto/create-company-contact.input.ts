import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateCompanyContactInput {
  @Field(() => String, { nullable: true })
  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido.' })
  @IsOptional()
  userId?: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50, {
    message: 'El nombre no puede exceder los $constraint1 caracteres.',
  })
  firstName: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El apellido debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(50, {
    message: 'El apellido no puede exceder los $constraint1 caracteres.',
  })
  lastName: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsOptional()
  @MaxLength(50, {
    message:
      'El correo electrónico no puede exceder los $constraint1 caracteres.',
  })
  email?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(20, {
    message: 'El teléfono no puede exceder los $constraint1 caracteres.',
  })
  phoneNumber?: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una empresa válida.' })
  @IsNotEmpty({ message: 'La empresa es obligatoria.' })
  companyId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El puesto debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El puesto es obligatorio.' })
  @MaxLength(50, {
    message: 'El puesto no puede exceder los $constraint1 caracteres.',
  })
  position: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean({ message: 'El valor debe ser verdadero o falso.' })
  @IsOptional()
  isPrimary?: boolean;
}
