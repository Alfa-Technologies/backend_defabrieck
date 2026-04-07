import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateVisualAidDocumentInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar una parte de proyecto válida.' })
  @IsNotEmpty({ message: 'La parte de proyecto es obligatoria.' })
  projectPartId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El código del documento debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El código del documento es obligatorio.' })
  documentCode: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre de la operación debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre de la operación es obligatorio.' })
  operationName: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La descripción de EPP debe ser un texto válido.' })
  @IsOptional()
  ppeDescription?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La revisión actual debe ser un texto válido.' })
  @IsOptional()
  currentRevision?: string;

  @Field(() => String, { nullable: true })
  @IsDateString(
    {},
    { message: 'La fecha de revisión actual debe ser una fecha válida.' },
  )
  @IsOptional()
  currentRevisionDate?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El estado debe ser un texto válido.' })
  @IsOptional()
  status?: string;
}
