import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  IsJSON,
} from 'class-validator';
import { Transform } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreatePpeCheckInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un empleado objetivo válido.' })
  @IsNotEmpty({ message: 'El empleado objetivo es obligatorio.' })
  targetEmployeeId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @IsIn(['COMPLIANT', 'NON_COMPLIANT'], {
    message: 'El estado debe ser "COMPLIANT" o "NON_COMPLIANT".',
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
  @MaxLength(100, {
    message: 'Los comentarios no pueden exceder los $constraint1 caracteres.',
  })
  comments?: string;
}
