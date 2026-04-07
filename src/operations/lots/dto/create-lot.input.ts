import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class CreateLotInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El número de lote debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El número de lote es obligatorio.' })
  @MaxLength(50, {
    message: 'El número de lote no puede exceder los $constraint1 caracteres.',
  })
  lotNumber: string;

  @Field(() => Int)
  @IsInt({ message: 'La cantidad total debe ser un número entero.' })
  @IsNotEmpty({ message: 'La cantidad total es obligatoria.' })
  @Min(1, { message: 'La cantidad total debe ser al menos $constraint1.' })
  totalQuantity: number;

  @Field(() => String, { nullable: true })
  @IsDateString(
    {},
    { message: 'La fecha de recepción debe ser una fecha válida.' },
  )
  @IsOptional()
  receivedAt?: string;
}
