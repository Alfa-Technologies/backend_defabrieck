import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreatePurchaseOrderInput } from './create-purchase-order.input';

@InputType()
export class UpdatePurchaseOrderInput extends PartialType(
  CreatePurchaseOrderInput,
) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
