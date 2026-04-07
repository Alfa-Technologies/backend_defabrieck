import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateDowntimeReasonInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El código debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @MaxLength(20, {
    message: 'El código no puede exceder los $constraint1 caracteres.',
  })
  code: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50, {
    message: 'El nombre no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => Boolean)
  @IsBoolean({ message: 'El valor debe ser verdadero o falso.' })
  isBillable: boolean;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La categoría debe ser un texto válido.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @MaxLength(50, {
    message: 'La categoría no puede exceder los $constraint1 caracteres.',
  })
  category: string;
}
