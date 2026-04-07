import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateProjectPartInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una parte del catálogo válida.' })
  @IsNotEmpty({ message: 'La parte del catálogo es obligatoria.' })
  partCatalogId: string;

  @Field(() => String)
  @IsString({ message: 'El número de parte debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El número de parte es obligatorio.' })
  @MaxLength(50, {
    message: 'El número de parte no puede exceder los $constraint1 caracteres.',
  })
  internalPartNumber: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(100, {
    message: 'La descripción no puede exceder los $constraint1 caracteres.',
  })
  description?: string;
}
