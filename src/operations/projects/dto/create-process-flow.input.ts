import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsObject,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateProcessFlowInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50, {
    message: 'El nombre no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: 'La descripción debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(150, {
    message: 'La descripción no puede exceder los $constraint1 caracteres.',
  })
  description?: string;

  @Field(() => GraphQLJSON)
  @IsObject({ message: 'Los datos del flujo deben ser un objeto válido.' })
  @IsNotEmpty({ message: 'Los datos del flujo son obligatorios.' })
  flowData: any;
}
