import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateVisualAidItemInput {
  @Field(() => String)
  @IsUUID('4', {
    message: 'Debe seleccionar un documento de ayuda visual válido.',
  })
  @IsNotEmpty({ message: 'El documento de ayuda visual es obligatorio.' })
  visualAidDocumentId: string;

  @Field(() => String, { nullable: true })
  @IsUUID('4', { message: 'Debe seleccionar un tipo de defecto válido.' })
  @IsOptional()
  defectTypeId?: string;

  @Field(() => Int)
  @IsInt({ message: 'El orden de visualización debe ser un número entero.' })
  @IsNotEmpty({ message: 'El orden de visualización es obligatorio.' })
  displayOrder: number;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre del defecto debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre del defecto es obligatorio.' })
  defectName: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El campo "qué" debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El campo "qué" es obligatorio.' })
  what: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El campo "cómo" debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El campo "cómo" es obligatorio.' })
  how: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El campo "por qué" debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El campo "por qué" es obligatorio.' })
  why: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La URL de imagen OK debe ser un texto válido.' })
  @IsOptional()
  imageOkUrl?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La URL de imagen NOK debe ser un texto válido.' })
  @IsOptional()
  imageNokUrl?: string;
}
