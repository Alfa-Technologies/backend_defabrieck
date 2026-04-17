import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateContractInput } from './create-contract.input';

@InputType()
export class UpdateContractInput extends PartialType(CreateContractInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
