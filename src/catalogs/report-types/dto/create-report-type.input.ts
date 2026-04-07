import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateReportTypeInput {
  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({
    message: 'El nombre del tipo de reporte debe ser un texto válido.',
  })
  @IsNotEmpty({ message: 'El nombre del tipo de reporte es obligatorio.' })
  @MaxLength(50, {
    message:
      'El nombre del tipo de reporte no puede exceder los $constraint1 caracteres.',
  })
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  defaultSchema?: any;
}
