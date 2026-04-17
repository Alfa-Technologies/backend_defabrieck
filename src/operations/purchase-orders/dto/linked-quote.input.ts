import { InputType, Field, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class LinkedQuoteInput {
  @Field(() => String)
  @IsUUID()
  quoteId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quoteNumber?: string;

  @Field(() => Float)
  @IsNumber()
  amount: number;
}
