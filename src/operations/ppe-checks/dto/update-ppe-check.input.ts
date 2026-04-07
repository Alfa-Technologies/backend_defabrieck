import { CreatePpeCheckInput } from './create-ppe-check.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePpeCheckInput extends PartialType(CreatePpeCheckInput) {
  @Field(() => Int)
  id: number;
}
