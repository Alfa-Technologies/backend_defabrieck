import { InputType, Field, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, IsString } from 'class-validator';

@InputType()
export class LinkedInvoicePoInput {
  @Field(() => String)
  @IsUUID()
  poId: string;

  @Field(() => String)
  @IsString()
  poNumber: string;

  @Field(() => Float)
  @IsNumber()
  amount: number;
}
