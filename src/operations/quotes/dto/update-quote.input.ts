import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsUUID, IsInt, IsOptional } from 'class-validator';
import { CreateQuoteInput } from './create-quote.input';

@InputType()
export class UpdateQuoteInput extends PartialType(CreateQuoteInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  version?: number;
}
