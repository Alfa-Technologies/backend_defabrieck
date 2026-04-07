import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreatePartCatalogInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de parte debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El número de parte es obligatorio.' })
  @MaxLength(50, {
    message: 'El número de parte no puede exceder los $constraint1 caracteres.',
  })
  partNumber: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(150, {
    message: 'La descripción no puede exceder los $constraint1 caracteres.',
  })
  description?: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un cliente válido.' })
  @IsNotEmpty({ message: 'El cliente es obligatorio.' })
  customerId: string;
}
