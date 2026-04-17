import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class QuoteServiceInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  type: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  @IsNotEmpty()
  details: any;
}
