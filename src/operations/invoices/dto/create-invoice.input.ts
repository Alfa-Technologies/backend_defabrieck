import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

import { InvoiceStatus } from '../enums/invoice.enums';
import { InvoiceConceptInput } from './invoice-concept.input';
import { LinkedInvoicePoInput } from './linked-po-relation.input';

@InputType()
export class CreateInvoiceInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  internalFolio: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  satFolio?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @Field(() => String)
  @IsUUID()
  companyId: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  paymentConditions?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  ownerName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @Field(() => String)
  @IsString()
  currency: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  issueDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  dueDate?: Date;

  @Field(() => Float)
  @IsNumber()
  subtotal: number;

  @Field(() => Float)
  @IsNumber()
  taxAmount: number;

  @Field(() => Float)
  @IsNumber()
  totalAmount: number;

  @Field(() => [InvoiceConceptInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceConceptInput)
  concepts: InvoiceConceptInput[];

  @Field(() => [LinkedInvoicePoInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkedInvoicePoInput)
  linkedPurchaseOrders: LinkedInvoicePoInput[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  log?: any[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  xmlUrl?: string;
}
