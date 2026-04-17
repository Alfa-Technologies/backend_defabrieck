import { InputType, Int, Field } from '@nestjs/graphql';
import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import { QuoteStatus } from '../enums/quote.enums';

import { PartyInfoInput } from './party-info.input';
import { QuoteServiceInput } from './quote-service.input';

@InputType()
export class CreateQuoteInput {
  @Field(() => Int)
  @IsInt()
  sequence: number;

  @Field(() => String)
  @IsString()
  quoteNumber: string;

  @Field(() => QuoteStatus, { nullable: true })
  @IsEnum(QuoteStatus)
  @IsOptional()
  status?: QuoteStatus;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @Field(() => PartyInfoInput)
  @ValidateNested()
  @Type(() => PartyInfoInput)
  serviceOfferedBy: PartyInfoInput;

  @Field(() => PartyInfoInput)
  @ValidateNested()
  @Type(() => PartyInfoInput)
  serviceRequestedBy: PartyInfoInput;

  @Field(() => [QuoteServiceInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteServiceInput)
  services: QuoteServiceInput[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  log?: any[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  qualitySystemCode?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  actorName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  issuedAt?: Date;
}
