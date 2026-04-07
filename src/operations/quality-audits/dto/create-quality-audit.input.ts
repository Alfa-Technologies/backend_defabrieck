import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsArray,
  IsJSON,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateQualityAuditInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un empleado objetivo válido.' })
  @IsNotEmpty({ message: 'El empleado objetivo es obligatorio.' })
  targetEmployeeId: string;

  @Field(() => Int)
  @IsInt({ message: 'El puntaje debe ser un número entero.' })
  @Min(0, { message: 'El puntaje mínimo es $constraint1.' })
  @Max(100, { message: 'El puntaje máximo es $constraint1.' })
  score: number;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  @MaxLength(50, {
    message: 'El estado no puede exceder los $constraint1 caracteres.',
  })
  status: string;

  @Field(() => GraphQLJSON)
  @IsJSON({ message: 'El cuerpo del checklist debe ser un JSON válido.' })
  @IsNotEmpty({ message: 'El cuerpo del checklist es obligatorio.' })
  checklistBody: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsJSON({ message: 'Las fotos de evidencia deben ser un JSON válido.' })
  evidencePhotos?: any;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'Los comentarios deben ser un texto válido.' })
  @IsOptional()
  @MaxLength(1000, {
    message: 'Los comentarios no pueden exceder los $constraint1 caracteres.',
  })
  comments?: string;
}
