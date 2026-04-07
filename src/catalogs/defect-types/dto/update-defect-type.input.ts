import { IsUUID } from 'class-validator';
import { CreateDefectTypeInput } from './create-defect-type.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateDefectTypeInput extends PartialType(CreateDefectTypeInput) {
  @Field(() => ID)
  @IsUUID('4', {
    message: 'El ID proporcionado no es un identificador válido.',
  })
  id: string;
}
