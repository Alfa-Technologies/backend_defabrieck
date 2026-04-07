import { IsUUID } from 'class-validator';
import { CreateLotInput } from './create-lot.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateLotInput extends PartialType(CreateLotInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
