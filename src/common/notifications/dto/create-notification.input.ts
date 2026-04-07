import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateNotificationInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un usuario válido.' })
  @IsNotEmpty({ message: 'El usuario es obligatorio.' })
  userId: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El título debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(50, {
    message: 'El título no puede exceder los $constraint1 caracteres.',
  })
  title: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El mensaje debe ser un texto válido.' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio.' })
  @MaxLength(150, {
    message: 'El mensaje no puede exceder los $constraint1 caracteres.',
  })
  message: string;

  @Field(() => String)
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El tipo debe ser un texto válido.' })
  @IsOptional()
  @MaxLength(50, {
    message: 'El tipo no puede exceder los $constraint1 caracteres.',
  })
  type?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}
