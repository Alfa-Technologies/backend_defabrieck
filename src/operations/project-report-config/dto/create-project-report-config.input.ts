import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsObject } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateProjectReportConfigInput {
  @Field(() => String)
  @IsUUID('4', { message: 'Debe seleccionar un proyecto válido.' })
  @IsNotEmpty({ message: 'El proyecto es obligatorio.' })
  projectId: string;

  @Field(() => GraphQLJSON)
  @IsObject({ message: 'El esquema final debe ser un objeto válido.' })
  finalSchema: any;
}
