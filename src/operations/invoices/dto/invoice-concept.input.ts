import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

@InputType()
export class InvoiceConceptInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Float)
  @IsNumber()
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  unitPrice: number;

  @Field(() => Boolean)
  @IsBoolean()
  applyTax: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  taxRate?: number;

  @Field(() => Float)
  @IsNumber()
  subtotal: number;
}
