import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateInvoiceInput } from './create-invoice.input';

@InputType()
export class UpdateInvoiceInput extends PartialType(CreateInvoiceInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
