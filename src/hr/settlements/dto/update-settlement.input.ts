import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateSettlementInput } from './create-settlement.input';

@InputType()
export class UpdateSettlementInput extends PartialType(CreateSettlementInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
