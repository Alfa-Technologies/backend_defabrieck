import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateQuoteSettingsInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  defaultActorName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  defaultQualitySystemCode?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  logoDataUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quotePrefix?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  accentColor?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  serviceDefaults?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  serviceOfferedBy?: any;
}
