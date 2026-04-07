import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateTemplateInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El código debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(50, {
    message: 'El código no puede exceder los $constraint1 caracteres.',
  })
  code: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El tipo de plantilla debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El tipo de plantilla es obligatorio.' })
  @MaxLength(50, {
    message:
      'El tipo de plantilla no puede exceder los $constraint1 caracteres.',
  })
  type: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El título debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(50, {
    message: 'El título no puede exceder los $constraint1 caracteres.',
  })
  title: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El asunto debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(150, {
    message: 'El asunto no puede exceder los $constraint1 caracteres.',
  })
  subject?: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El contenido debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El contenido es obligatorio.' })
  content: string;
}
