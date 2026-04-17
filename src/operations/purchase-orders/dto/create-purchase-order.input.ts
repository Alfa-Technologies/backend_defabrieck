import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

import { POStatus } from '../enums/purchase-order.enums';
import { LinkedQuoteInput } from './linked-quote.input';

@InputType()
export class CreatePurchaseOrderInput {
  @Field(() => String)
  @IsString()
  internalNumber: string;

  @Field(() => String)
  @IsString()
  customerPoNumber: string;

  @Field(() => POStatus, { nullable: true })
  @IsEnum(POStatus)
  @IsOptional()
  status?: POStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  receivedAt?: Date;

  @Field(() => String)
  @IsUUID()
  companyId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @Field(() => Float)
  @IsNumber()
  clientAmount: number;

  @Field(() => String)
  @IsString()
  currency: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ownerName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @Field(() => [LinkedQuoteInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkedQuoteInput)
  linkedQuotes: LinkedQuoteInput[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  log?: any[];
}
